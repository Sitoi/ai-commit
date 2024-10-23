import { i18n, I18nLocals } from './i18n';
import { ConfigKeys, getConfig } from './config';
import { removeConventionalCommitWord } from './utils';

/**
 * Retrieves the current language setting from the configuration.
 * @constant {string} language - The language for commit messages.
 * @constant {boolean} emoji_enabled - Flag indicating if emojis are enabled.
 * @constant {boolean} fullGitMojiSpec - Flag indicating if full GitMoji specification is used.
 */
const language = getConfig<string>(ConfigKeys.AI_COMMIT_LANGUAGE);
const emoji_enabled = getConfig<boolean>(ConfigKeys.EMOJI_ENABLED);
const fullGitMojiSpec = getConfig<boolean>(ConfigKeys.FULL_GITMOJI_SPEC);

/**
 * Retrieves the translation for the specified language.
 * @constant {I18nLocals} translation - The translation object for the current language.
 */
const translation = i18n[(language as I18nLocals) || 'en'];

/**
 * The identity prompt for the AI commit message generator.
 * @constant {string} IDENTITY - The identity description for the AI.
 */
export const IDENTITY = 'You are to act as the author of a commit message in git.';

/**
 * Initializes the main prompt for generating commit messages.
 * 
 * @param {string} language - The language to be used in the prompt.
 * @returns {Object} - The main prompt object containing role and content.
 */
const INIT_MAIN_PROMPT = (language: string) => ({
  role: 'system',
  content: `${IDENTITY} Your mission is to create clean and comprehensive commit messages as per the ${
    fullGitMojiSpec ? 'GitMoji specification' : 'conventional commit convention'
  } and explain WHAT were the changes and mainly WHY the changes were done. I'll send you an output of 'git diff --staged' command, and you are to convert it into a commit message.
    ${
      emoji_enabled
        ? 'Use GitMoji convention to preface the commit. Here are some help to choose the right emoji (emoji, description): ' +
          '🐛, Fix a bug; ' +
          '✨, Introduce new features; ' +
          '📝, Add or update documentation; ' +
          '🚀, Deploy stuff; ' +
          '✅, Add, update, or pass tests; ' +
          '♻️, Refactor code; ' +
          '⬆️, Upgrade dependencies; ' +
          '🔧, Add or update configuration files; ' +
          '🌐, Internationalization and localization; ' +
          '💡, Add or update comments in source code; ' +
          `${
            fullGitMojiSpec
              ? '🎨, Improve structure / format of the code; ' +
                '⚡️, Improve performance; ' +
                '🔥, Remove code or files; ' +
                '🚑️, Critical hotfix; ' +
                '💄, Add or update the UI and style files; ' +
                '🎉, Begin a project; ' +
                '🔒️, Fix security issues; ' +
                '🔐, Add or update secrets; ' +
                '🔖, Release / Version tags; ' +
                '🚨, Fix compiler / linter warnings; ' +
                '🚧, Work in progress; ' +
                '💚, Fix CI Build; ' +
                '⬇️, Downgrade dependencies; ' +
                '📌, Pin dependencies to specific versions; ' +
                '👷, Add or update CI build system; ' +
                '📈, Add or update analytics or track code; ' +
                '➕, Add a dependency; ' +
                '➖, Remove a dependency; ' +
                '🔨, Add or update development scripts; ' +
                '✏️, Fix typos; ' +
                '💩, Write bad code that needs to be improved; ' +
                '⏪️, Revert changes; ' +
                '🔀, Merge branches; ' +
                '📦️, Add or update compiled files or packages; ' +
                '👽️, Update code due to external API changes; ' +
                '🚚, Move or rename resources (e.g.: files, paths, routes); ' +
                '📄, Add or update license; ' +
                '💥, Introduce breaking changes; ' +
                '🍱, Add or update assets; ' +
                '♿️, Improve accessibility; ' +
                '🍻, Write code drunkenly; ' +
                '💬, Add or update text and literals; ' +
                '🗃️, Perform database related changes; ' +
                '🔊, Add or update logs; ' +
                '🔇, Remove logs; ' +
                '👥, Add or update contributor(s); ' +
                '🚸, Improve user experience / usability; ' +
                '🏗️, Make architectural changes; ' +
                '📱, Work on responsive design; ' +
                '🤡, Mock things; ' +
                '🥚, Add or update an easter egg; ' +
                '🙈, Add or update a .gitignore file; ' +
                '📸, Add or update snapshots; ' +
                '⚗️, Perform experiments; ' +
                '🔍️, Improve SEO; ' +
                '🏷️, Add or update types; ' +
                '🌱, Add or update seed files; ' +
                '🚩, Add, update, or remove feature flags; ' +
                '🥅, Catch errors; ' +
                '💫, Add or update animations and transitions; ' +
                '🗑️, Deprecate code that needs to be cleaned up; ' +
                '🛂, Work on code related to authorization, roles and permissions; ' +
                '🩹, Simple fix for a non-critical issue; ' +
                '🧐, Data exploration/inspection; ' +
                '⚰️, Remove dead code; ' +
                '🧪, Add a failing test; ' +
                '👔, Add or update business logic; ' +
                '🩺, Add or update healthcheck; ' +
                '🧱, Infrastructure related changes; ' +
                '🧑‍💻, Improve developer experience; ' +
                '💸, Add sponsorships or money related infrastructure; ' +
                '🧵, Add or update code related to multithreading or concurrency; ' +
                '🦺, Add or update code related to validation.'
              : ''
          }`
        : 'Do not preface the commit with anything. Conventional commit keywords:' +
          'fix, feat, build, chore, ci, docs, style, refactor, perf, test.'
    }\nDon't add any descriptions to the commit, only commit message.\nUse the present tense. Lines must not be longer than 74 characters. Use ${language} for the commit message.`
});

/**
 * Initializes the diff prompt for generating commit messages based on the provided diff.
 * 
 * @type {Object} INIT_DIFF_PROMPT - The prompt object for the user role containing the diff content.
 */
export const INIT_DIFF_PROMPT = {
  role: 'user',
  content: `diff --git a/src/server.ts b/src/server.ts
      index ad4db42..f3b18a9 100644
      --- a/src/server.ts
      +++ b/src/server.ts
      @@ -10,7 +10,7 @@
      import {
          initWinstonLogger();
          
          const app = express();
          -const port = 7799;
          +const PORT = 7799;
          
          app.use(express.json());
          
          @@ -34,6 +34,6 @@
          app.use((_, res, next) => {
              // ROUTES
              app.use(PROTECTED_ROUTER_URL, protectedRouter);
              
              -app.listen(port, () => {
                  -  console.log(\`Server listening on port \${port}\`);
                  +app.listen(process.env.PORT || PORT, () => {
                      +  console.log(\`Server listening on port \${PORT}\`);
                  });`
};

/**
 * Initializes the consistency prompt for generating commit messages.
 * 
 * @param {Object} translation - The translation object containing commit message templates.
 * @returns {Object} - The consistency prompt object containing role and content.
 */
const INIT_CONSISTENCY_PROMPT = (translation) => ({
  role: 'assistant',
  content: `${
    emoji_enabled
      ? `🐛 ${removeConventionalCommitWord(translation.commitFix)}`
      : translation.commitFix
  }
  ${
    emoji_enabled
      ? `✨ ${removeConventionalCommitWord(translation.commitFeat)}`
      : translation.commitFeat
  }
`
});

/**
 * Retrieves the main commit prompt, including the main prompt, diff prompt, and consistency prompt.
 * 
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of prompts for generating commit messages.
 */
export const getMainCommitPrompt = async () => {
  return [
    INIT_MAIN_PROMPT(translation.localLanguage),
    INIT_DIFF_PROMPT,
    INIT_CONSISTENCY_PROMPT(translation)
  ];
};
