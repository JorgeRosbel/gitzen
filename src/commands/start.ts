import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import { join } from 'path';
import boxen from 'boxen';
import type { TCommitTemplate, TModel, TSize, TLang, TProviders } from '../types';
import { gitInit } from '@/utils/gitInit';

// npm run build && npm link && autocommit start

const gitInitConfirm = async () => {
  const response = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'git_init',
      message: 'Do you want to initialize git?',
      default: true,
    },
  ]);

  if (response.git_init) {
    const res = await gitInit();
    console.log(chalk.green(res));
  }
};

const gitCommitTemplate = async () => {
  const templates = [
    { name: chalk.green('commitlint'), value: 'commitlint' },
    { name: chalk.blue('conventional'), value: 'conventional' },
    { name: chalk.blue('angular'), value: 'angular' },
  ];

  const { selectedTemplate } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedTemplate',
      message: 'Select a commit template to use:',
      choices: templates,
    },
  ]);

  return selectedTemplate;
};

const initModel = async () => {
  const models = [
    {
      name: `${chalk.green('gpt-4.1')} - ${chalk.dim('Latest GPT-4 model')}`,
      value: 'gpt-4.1',
    },
    {
      name: `${chalk.green('gpt-4.1-nano-2025-04-14')} - ${chalk.dim('Fastest, most cost-effective GPT-4.1 model')}`,
      value: 'gpt-4.1-nano-2025-04-14',
    },
    {
      name: `${chalk.blue('gpt-4o-2024-08-06')} ${chalk.yellow('🧠')} - High precision with zodResponseFormat`,
      value: 'gpt-4o-2024-08-06',
    },
    {
      name: `${chalk.cyan('gpt-4o-mini')} ${chalk.yellow('⚡')} - Faster and more affordable`,
      value: 'gpt-4o-mini',
    },
    {
      name: `${chalk.cyan('gpt-4.1-nano')} ${chalk.yellow('⚡')} - Faster and more affordable`,
      value: 'gpt-4.1-nano-2025-04-14',
    },
    {
      name: `${chalk.magenta('gpt-4')} - More expensive but compatible`,
      value: 'gpt-4',
    },
    {
      name: `${chalk.yellow('gpt-3.5-turbo')} - Good for simple tasks`,
      value: 'gpt-3.5-turbo',
    },
    {
      name: `${chalk.blueBright('gemini-2.5-flash')} - Google's Gemini model`,
      value: 'gemini-2.5-flash',
    },
    {
      name: `${chalk.blue('gemini-2.0-flash')} - Previous version of Gemini`,
      value: 'gemini-2.0-flash',
    },
  ];

  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: 'Select an AI model to use:',
      choices: models,
      pageSize: 10,
    },
  ]);

  return selectedModel;
};

const commitSize = async () => {
  const sizes = [
    { name: chalk.green('small'), value: '16–35 characters' },
    { name: chalk.blue('medium'), value: '36–50 characters' },
    { name: chalk.cyan('large'), value: '51–80 characters' },
    { name: chalk.magenta('extra-large'), value: '81–120 characters' },
  ];

  const { selectedSize } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedSize',
      message: 'Select a commit size to use:',
      choices: sizes,
      pageSize: 10,
    },
  ]);

  return selectedSize;
};

const initApiKey = async () => {
  const { apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your API key:',
    },
  ]);

  const out = `
  export API_KEY="${apiKey}"

  if grep -q '^export GITZEN_API_KEY=' ~/.bashrc; then
    # Reemplaza la línea existente
    sed -i "s|^export GITZEN_API_KEY=.*|export GITZEN_API_KEY=\"$API_KEY\"|" ~/.bashrc
  else
    # Añade la línea al final
    echo "export GITZEN_API_KEY=\"$API_KEY\"" >> ~/.bashrc
  fi

  source ~/.bashrc
  echo "✅ GITZEN_API_KEY set to \"$API_KEY\""

  `;

  console.log(
    boxen(
      chalk.blue(
        'Copy and paste this script into your terminal to add GITZEN_API_KEY to your environment variables:'
      ),
      { padding: 1 }
    )
  );
  console.log(
    chalk.dim(
      'This will add your API key to your ~/.bashrc file, so it will be available in your terminal sessions.'
    )
  );
  console.log(chalk.cyanBright(out));
};

const initLang = async () => {
  const languages = [
    { name: chalk.blue('en'), value: 'en' },
    { name: chalk.green('es'), value: 'es' },
    { name: chalk.cyan('pt'), value: 'pt' },
    { name: chalk.magenta('fr'), value: 'fr' },
    { name: chalk.yellow('de'), value: 'de' },
    { name: chalk.grey('it'), value: 'it' },
    { name: chalk.red('zh'), value: 'zh' },
    { name: chalk.greenBright('ja'), value: 'ja' },
    { name: chalk.blueBright('ko'), value: 'ko' },
  ];

  const { selectedLanguage } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedLanguage',
      message: 'Select a language to use:',
      choices: languages,
    },
  ]);

  return selectedLanguage;
};

const initProviders = async () => {
  const providers = [
    { name: chalk.blue('openai'), value: 'openai' },
    { name: chalk.green('google'), value: 'google' },
  ];

  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select your provider:',
      choices: providers,
    },
  ]);

  return provider;
};

const saveConfig = (
  template: TCommitTemplate,
  model: TModel,
  size: TSize,
  language: TLang,
  provider: TProviders
) => {
  const config = {
    language: language,
    template: template,
    model: model,
    size: size,
    provider: provider,
  };

  const config_json = join(process.cwd(), 'gitzen.config.json');

  fs.writeFileSync(config_json, JSON.stringify(config, null, 2));

  console.log(chalk.green('Configuration saved successfully!'));
  console.log(boxen(JSON.stringify(config, null, 2), { padding: 1 }));
};

export const start = async () => {
  try {
    const config_json = join(process.cwd(), 'gitzen.config.json');

    if (fs.existsSync(config_json)) {
      console.log(
        boxen(
          chalk.green("You don't need to use gitzen start, you already have a configuration file!"),
          { padding: 1 }
        )
      );
      process.exit(0);
    }

    console.log(boxen(chalk.blue("Let's start the configuration process"), { padding: 1 }));

    await gitInitConfirm();
    const template = (await gitCommitTemplate()) as TCommitTemplate;
    const language = (await initLang()) as TLang;
    const model = (await initModel()) as TModel;
    const size = (await commitSize()) as TSize;
    const provider = (await initProviders()) as TProviders;
    saveConfig(template, model, size, language, provider);
    if (!process.env.GITZEN_API_KEY) {
      await initApiKey();
    }

    console.log(boxen(chalk.green('Configuration completed successfully!'), { padding: 1 }));

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
