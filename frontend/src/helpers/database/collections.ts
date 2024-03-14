// Collections
export enum dbCollections {
  users = "users",
  exercises = "exercises",
  programs = "programs",
  maxlifts = "maxlifts",
}

// Subcollections
export enum dbSubcollections {
  // Under "programs"
  programSnapshots = "snapshots",
  programFeedbacks = "feedbacks",

  // Under "users"
  userConfig = "info",
}

// Known document IDs
export enum dbFixedIds {
  // User config
  userConfig = "config",
}
