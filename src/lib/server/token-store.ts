export type TokenProcessingEntry = {
  token: number;
  processingTimeMs: number;
  completedTimestamp: string;
};

export type CompletedTokenEntry = {
  token: number;
  completedTimestamp: string;
};

export type TokenBoardState = {
  mandiId: string;
  date: string;
  capacity: number;
  currentToken: number | null;
  pendingTokens: number[];
  dailyTokenNumbers: number[];
  tokenStartedTimestamp: number | null;
  completedTokens: CompletedTokenEntry[];
  processingTimes: TokenProcessingEntry[];
  averageProcessingTimePerToken: number | null;
  mandiOpen: boolean;
  expectedOpenTime: string;
  expectedCloseTime: string;
  setupCompletedAt: string | null;
  lastUpdatedTimestamp: number;
};

type TokenSnapshot = Pick<
  TokenBoardState,
  | "currentToken"
  | "pendingTokens"
  | "tokenStartedTimestamp"
  | "completedTokens"
  | "processingTimes"
  | "averageProcessingTimePerToken"
>;

type MandiTokenRecord = TokenBoardState & {
  lastAdvanceTimestamp: number | null;
  undoHistory: TokenSnapshot[];
};

type TokenStoreGlobal = typeof globalThis & {
  __mandiTokenStore?: Map<string, MandiTokenRecord>;
};

const tokenStore = ((globalThis as TokenStoreGlobal).__mandiTokenStore ??= new Map());

function getMandiDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function createInitialState(mandiId: string, date: string, previousCapacity: number): MandiTokenRecord {
  const now = Date.now();
  return {
    mandiId,
    date,
    capacity: previousCapacity,
    currentToken: null,
    pendingTokens: [],
    dailyTokenNumbers: [],
    tokenStartedTimestamp: null,
    completedTokens: [],
    processingTimes: [],
    averageProcessingTimePerToken: null,
    mandiOpen: false,
    expectedOpenTime: "08:00",
    expectedCloseTime: "18:00",
    setupCompletedAt: null,
    lastUpdatedTimestamp: now,
    lastAdvanceTimestamp: null,
    undoHistory: [],
  };
}

function getRecord(mandiId: string): MandiTokenRecord {
  const normalizedId = mandiId.trim().toLowerCase();
  const date = getMandiDate();
  const key = `${normalizedId}:${date}`;
  let state = tokenStore.get(key);
  if (!state) {
    const previousCapacity = [...tokenStore.values()]
      .filter((record) => record.mandiId === normalizedId && record.date < date)
      .sort((left, right) => right.date.localeCompare(left.date))[0]?.capacity ?? 120;
    state = createInitialState(normalizedId, date, previousCapacity);
    tokenStore.set(key, state);
  }
  return state;
}

function takeSnapshot(state: MandiTokenRecord): TokenSnapshot {
  return {
    currentToken: state.currentToken,
    pendingTokens: [...state.pendingTokens],
    tokenStartedTimestamp: state.tokenStartedTimestamp,
    completedTokens: state.completedTokens.map((entry) => ({ ...entry })),
    processingTimes: state.processingTimes.map((entry) => ({ ...entry })),
    averageProcessingTimePerToken: state.averageProcessingTimePerToken,
  };
}

function publicState(state: MandiTokenRecord): TokenBoardState {
  return {
    mandiId: state.mandiId,
    date: state.date,
    capacity: state.capacity,
    currentToken: state.currentToken,
    pendingTokens: [...state.pendingTokens],
    dailyTokenNumbers: [...state.dailyTokenNumbers],
    tokenStartedTimestamp: state.tokenStartedTimestamp,
    completedTokens: state.completedTokens.map((entry) => ({ ...entry })),
    processingTimes: state.processingTimes.map((entry) => ({ ...entry })),
    averageProcessingTimePerToken: state.averageProcessingTimePerToken,
    mandiOpen: state.mandiOpen,
    expectedOpenTime: state.expectedOpenTime,
    expectedCloseTime: state.expectedCloseTime,
    setupCompletedAt: state.setupCompletedAt,
    lastUpdatedTimestamp: state.lastUpdatedTimestamp,
  };
}

export function getTokenState(mandiId: string): TokenBoardState {
  return publicState(getRecord(mandiId));
}

export function setupDailyMandi(
  mandiId: string,
  setup: { capacity: number; mandiOpen: boolean; expectedOpenTime: string; expectedCloseTime: string },
) {
  const state = getRecord(mandiId);
  const now = Date.now();
  const dailyTokenNumbers = Array.from({ length: 8 }, (_, index) => index + 1);

  state.capacity = setup.capacity;
  state.currentToken = 1;
  state.pendingTokens = dailyTokenNumbers.slice(1);
  state.dailyTokenNumbers = dailyTokenNumbers;
  state.tokenStartedTimestamp = now;
  state.completedTokens = [];
  state.processingTimes = [];
  state.averageProcessingTimePerToken = null;
  state.mandiOpen = setup.mandiOpen;
  state.expectedOpenTime = setup.expectedOpenTime;
  state.expectedCloseTime = setup.expectedCloseTime;
  state.setupCompletedAt = new Date(now).toISOString();
  state.lastUpdatedTimestamp = now;
  state.lastAdvanceTimestamp = null;
  state.undoHistory = [];

  return publicState(state);
}

export function advanceToken(mandiId: string) {
  const state = getRecord(mandiId);
  const now = Date.now();
  const noMoreTokens = state.currentToken === null && state.pendingTokens.length === 0;

  if (!state.setupCompletedAt) {
    return { state: publicState(state), advanced: false, debounced: false, noMoreTokens: false, requiresSetup: true };
  }
  if (state.lastAdvanceTimestamp !== null && now - state.lastAdvanceTimestamp < 5000) {
    return { state: publicState(state), advanced: false, debounced: true, noMoreTokens };
  }
  if (noMoreTokens) {
    return { state: publicState(state), advanced: false, debounced: false, noMoreTokens: true };
  }

  state.undoHistory.push(takeSnapshot(state));
  if (state.undoHistory.length > 10) state.undoHistory.shift();

  if (state.currentToken !== null && state.tokenStartedTimestamp !== null) {
    const completedTimestamp = new Date(now).toISOString();
    const processingTimeMs = Math.max(0, now - state.tokenStartedTimestamp);
    state.completedTokens = [
      ...state.completedTokens,
      { token: state.currentToken, completedTimestamp },
    ].slice(-50);
    state.processingTimes = [
      ...state.processingTimes,
      { token: state.currentToken, processingTimeMs, completedTimestamp },
    ].slice(-10);
    state.averageProcessingTimePerToken = Math.round(
      state.processingTimes.reduce((total, entry) => total + entry.processingTimeMs, 0) / state.processingTimes.length,
    );
  }

  state.currentToken = state.pendingTokens.shift() ?? null;
  state.tokenStartedTimestamp = state.currentToken === null ? null : now;
  state.lastAdvanceTimestamp = now;
  state.lastUpdatedTimestamp = now;

  return {
    state: publicState(state),
    advanced: true,
    debounced: false,
    noMoreTokens: state.currentToken === null,
  };
}

export function undoTokenAdvance(mandiId: string) {
  const state = getRecord(mandiId);
  const snapshot = state.undoHistory.pop();
  if (!snapshot) {
    return { state: publicState(state), undone: false };
  }

  state.currentToken = snapshot.currentToken;
  state.pendingTokens = [...snapshot.pendingTokens];
  state.tokenStartedTimestamp = snapshot.tokenStartedTimestamp;
  state.completedTokens = snapshot.completedTokens.map((entry) => ({ ...entry }));
  state.processingTimes = snapshot.processingTimes.map((entry) => ({ ...entry }));
  state.averageProcessingTimePerToken = snapshot.averageProcessingTimePerToken;
  state.lastAdvanceTimestamp = null;
  state.lastUpdatedTimestamp = Date.now();

  return { state: publicState(state), undone: true };
}