import * as vscode from "vscode";

const getConfigFor = <T>(key: string) =>
  vscode.workspace.getConfiguration("documentation-pilot").get(key) as T;

export const getPackagesConfig = () =>
  getConfigFor<string[] | undefined>("packages");

export const getDataConfig = () =>
  getConfigFor<Record<string, { url: string }> | undefined>("data");

export const getWebViewTabTitleConfig = () =>
  getConfigFor<string>("webViewTabTitle") ?? "Documentation Pilot";

export const getCustomLinkTextConfig = () =>
  getConfigFor<string>("customLinkText") ?? "View Documentation";
