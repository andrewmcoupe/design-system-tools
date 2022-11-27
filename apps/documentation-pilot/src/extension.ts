import * as vscode from "vscode";
import traverse, { TraverseOptions } from "@babel/traverse";
import { parseFileContents } from "@design-system-tools/documentation-pilot-parser";
import {
  getCustomLinkTextConfig,
  getDataConfig,
  getPackagesConfig,
  getWebViewTabTitleConfig,
} from "./utils";

const languages = ["typescriptreact", "javascriptreact"];

export function activate(context: vscode.ExtensionContext) {
  const importsFromMyPackages: string[] = [];

  console.log(
    'Congratulations, your extension "Documentation Pilot" is now activated!!!!!'
  );

  // Get configurations via VS Code workspace settings
  let configData = getDataConfig();
  let webViewTabTitle = getWebViewTabTitleConfig();
  let packages = getPackagesConfig();
  let hoverLinkTitle = getCustomLinkTextConfig();

  if (!configData || !packages) {
    vscode.window
      .showWarningMessage(
        "Documentation Pilot must be configured to work properly.",
        "Configure Documentation Pilot"
      )
      .then((selection) => {
        if (selection === "Configure Documentation Pilot") {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "documentation-pilot.data"
          );
        }
      });
    return;
  }

  const document = vscode.window.activeTextEditor?.document;

  if (!document) {
    return;
  }

  const onSettingsUpdated = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("documentation-pilot.packages")) {
      packages = getPackagesConfig();

      vscode.window.showInformationMessage(
        "Documentation Pilot package settings updated."
      );
    }

    if (e.affectsConfiguration("documentation-pilot.webViewTabTitle")) {
      webViewTabTitle = getWebViewTabTitleConfig();

      vscode.window.showInformationMessage(
        "Documentation Pilot web view tab title updated."
      );
    }

    if (e.affectsConfiguration("documentation-pilot.customLinkText")) {
      hoverLinkTitle = getCustomLinkTextConfig();

      vscode.window.showInformationMessage(
        "Documentation Pilot web link text updated."
      );
    }

    if (e.affectsConfiguration("documentation-pilot.data")) {
      configData = getDataConfig();

      vscode.window.showInformationMessage(
        "Documentation Pilot data settings updated."
      );
    }
  });

  const traverseOptions: TraverseOptions = {
    ImportDeclaration(path) {
      const { source, specifiers } = path.node;

      if (packages?.includes(source.value)) {
        specifiers.forEach((specifier) => {
          const { local } = specifier;
          const { name } = local;

          importsFromMyPackages.push(name);
        });
      }
    },
  };

  const parsedFileContents = parseFileContents(document.getText());

  traverse(parsedFileContents, traverseOptions);

  const hoverProvider = vscode.languages.registerHoverProvider(languages, {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      const wordBeingHovered = document.getText(range);

      const viewInDocumentationCommand = vscode.Uri.parse(
        `command:documentation-pilot.viewComponentInWebView?${encodeURIComponent(
          JSON.stringify({
            // This is the data that will be passed to the command
            componentName: wordBeingHovered,
            documentationUrl: configData?.[wordBeingHovered].url,
          })
        )}`
      );

      // The content in the hover tooltip
      const hoverContent = new vscode.MarkdownString(
        `[${hoverLinkTitle}](${viewInDocumentationCommand})`
      );
      hoverContent.isTrusted = true;

      if (!configData) return;

      // If the configData contains the word being hovered, return the hover content
      if (Object.keys(configData).includes(wordBeingHovered)) {
        return new vscode.Hover(hoverContent);
      }
    },
  });

  // When the document is saved, parse the file contents again
  // The user may have imported a new component, this will update importsFromMyPackages
  const documentSavedDisposable = vscode.workspace.onDidSaveTextDocument(
    (savedDocument) => {
      if (savedDocument.uri.path !== document.uri.path) {
        return;
      }

      const fileContents = savedDocument.getText();

      const parseResult = parseFileContents(fileContents);

      traverse(parseResult, traverseOptions);
    }
  );

  const createWebViewDisposable = vscode.commands.registerCommand(
    "documentation-pilot.viewComponentInWebView",
    (args: { componentName: string; documentationUrl: string }) => {
      const webViewPanel = vscode.window.createWebviewPanel(
        "viewDocsInWebView",
        webViewTabTitle,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      webViewPanel.webview.html = `
	  	<html lang="en" style="height: 100%;">
			<body style="height: 100%;">
				<iframe src="${args.documentationUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
			</body>
		</html>
		`;
    }
  );

  // When this extension is deactivated the subscriptions will be disposed of.
  context.subscriptions.push(hoverProvider);
  context.subscriptions.push(createWebViewDisposable);
  context.subscriptions.push(documentSavedDisposable);
  context.subscriptions.push(onSettingsUpdated);
}

export function deactivate() {}
