import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import type { Ora } from 'ora';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION = "1.0.0";
const __dirname = fileURLToPath(new URL('.', import.meta.url));

interface ProjectTemplate {
  name: string;
  description: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

const PROJECT_TEMPLATES: Record<string, ProjectTemplate> = {
  'web-basic': {
    name: 'Basic Web App',
    description: 'Simple web application with React and Express',
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'express': '^4.18.2',
    },
    devDependencies: {
      'typescript': '^5.3.3',
      'vite': '^5.0.0',
    },
    scripts: {
      'dev': 'vite',
      'build': 'tsc && vite build',
      'start': 'node server.js',
    },
  },
  'api-server': {
    name: 'API Server',
    description: 'RESTful API server with Express and MongoDB',
    dependencies: {
      'express': '^4.18.2',
      'mongoose': '^8.0.0',
      'cors': '^2.8.5',
    },
    devDependencies: {
      'typescript': '^5.3.3',
      'nodemon': '^3.0.0',
    },
    scripts: {
      'dev': 'nodemon src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
    },
  },
};

async function showLogo(): Promise<void> {
  console.log(chalk.cyan(`
    ██████╗ ███████╗██╗   ██╗███████╗██████╗  █████╗ ██████╗ ██╗  ██╗
    ██╔══██╗██╔════╝██║   ██║██╔════╝██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝
    ██║  ██║█████╗  ██║   ██║███████╗██████╔╝███████║██████╔╝█████╔╝ 
    ██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██╔═══╝ ██╔══██║██╔══██╗██╔═██╗ 
    ██████╔╝███████╗ ╚████╔╝ ███████║██║     ██║  ██║██║  ██║██║  ██╗
    ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
  `));
  console.log(chalk.yellow(`  🚀 Version ${VERSION}\n`));
}

async function initGit(projectPath: string): Promise<void> {
  const spinner = ora('Initializing Git repository...').start();
  try {
    await new Promise((resolve, reject) => {
      const git = spawn('git', ['init'], { cwd: projectPath });
      git.on('close', (code) => code === 0 ? resolve(null) : reject());
    });
    
    // Create .gitignore
    await writeFile(join(projectPath, '.gitignore'), `
node_modules/
dist/
.env
*.log
    `.trim());
    
    spinner.succeed('Git repository initialized');
  } catch (error) {
    spinner.fail('Failed to initialize Git repository');
    throw error;
  }
}

async function createProject(): Promise<void> {
  const spinner: Ora = ora();
  try {
    const { projectName } = await inquirer.prompt<{ projectName: string }>({
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (value: string) => value.trim().length >= 2,
    });

    const { template } = await inquirer.prompt<{ template: string }>({
      type: 'list',
      name: 'template',
      message: 'Select project template:',
      choices: Object.entries(PROJECT_TEMPLATES).map(([key, template]) => ({
        name: `${template.name} - ${template.description}`,
        value: key,
      })),
    });

    const { useGit } = await inquirer.prompt<{ useGit: boolean }>({
      type: 'confirm',
      name: 'useGit',
      message: 'Initialize Git repository?',
      default: true,
    });

    const projectPath = join(process.cwd(), projectName);
    spinner.start('Creating project directory...');
    await mkdir(projectPath, { recursive: true });

    // Create package.json
    const selectedTemplate = PROJECT_TEMPLATES[template];
    const packageJson = {
      name: projectName,
      version: '0.1.0',
      type: 'module',
      scripts: selectedTemplate.scripts,
      dependencies: selectedTemplate.dependencies,
      devDependencies: selectedTemplate.devDependencies,
    };

    await writeFile(
      join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    if (useGit) {
      await initGit(projectPath);
    }

    spinner.succeed('Project created successfully!');

    console.log('\n' + chalk.green('✓') + ' Project details:');
    console.table({
      Name: chalk.cyan(projectName),
      Template: chalk.yellow(selectedTemplate.name),
      Git: useGit ? chalk.green('Initialized') : chalk.red('Not initialized'),
    });

    console.log('\n📦 Next steps:');
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  yarn install'));
    console.log(chalk.cyan('  yarn dev'));
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(chalk.red('Failed to create project: ' + error.message));
    } else {
      spinner.fail(chalk.red('Failed to create project'));
    }
  }
}

async function manageDependencies(): Promise<void> {
  const { action } = await inquirer.prompt<{ action: string }>({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      { name: 'Add dependencies', value: 'add' },
      { name: 'Remove dependencies', value: 'remove' },
      { name: 'Update dependencies', value: 'update' },
      { name: 'List outdated dependencies', value: 'outdated' },
    ],
  });

  const spinner = ora();

  try {
    switch (action) {
      case 'add': {
        const { packages } = await inquirer.prompt<{ packages: string }>({
          type: 'input',
          name: 'packages',
          message: 'Enter package names (space separated):',
          validate: (value) => value.trim().length > 0,
        });

        const { isDev } = await inquirer.prompt<{ isDev: boolean }>({
          type: 'confirm',
          name: 'isDev',
          message: 'Install as dev dependency?',
          default: false,
        });

        spinner.start('Installing packages...');
        const args = ['add', ...packages.split(' ')];
        if (isDev) args.unshift('-D');
        
        const install = spawn('yarn', args, { stdio: 'inherit' });
        await new Promise((resolve) => install.on('close', resolve));
        spinner.succeed('Packages installed successfully');
        break;
      }

      case 'remove': {
        const packageJson = JSON.parse(await readFile('package.json', 'utf-8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        const { packages } = await inquirer.prompt<{ packages: string[] }>({
          type: 'checkbox',
          name: 'packages',
          message: 'Select packages to remove:',
          choices: Object.keys(allDeps),
        });

        if (packages.length > 0) {
          spinner.start('Removing packages...');
          const remove = spawn('yarn', ['remove', ...packages], { stdio: 'inherit' });
          await new Promise((resolve) => remove.on('close', resolve));
          spinner.succeed('Packages removed successfully');
        }
        break;
      }

      case 'update':
        spinner.start('Updating dependencies...');
        const update = spawn('yarn', ['upgrade'], { stdio: 'inherit' });
        await new Promise((resolve) => update.on('close', resolve));
        spinner.succeed('Dependencies updated successfully');
        break;

      case 'outdated':
        console.log(chalk.cyan('\nChecking for outdated dependencies...\n'));
        const outdated = spawn('yarn', ['outdated'], { stdio: 'inherit' });
        await new Promise((resolve) => outdated.on('close', resolve));
        break;
    }
  } catch (error) {
    spinner.fail(chalk.red('Operation failed'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
  }
}

async function startWebApp(): Promise<void> {
  const spinner = ora('Starting DevSpark web application...').start();
  
  try {
    const { mode } = await inquirer.prompt<{ mode: 'development' | 'production' }>({
      type: 'list',
      name: 'mode',
      message: 'Select running mode:',
      choices: [
        { name: '🛠️  Development (with hot reload)', value: 'development' },
        { name: '🚀 Production', value: 'production' },
      ],
    });

    spinner.stop();
    console.log(chalk.cyan('\n📦 Installing dependencies...\n'));

    // Install dependencies
    const install = spawn('yarn', ['install'], { stdio: 'inherit' });
    await new Promise((resolve) => install.on('close', resolve));

    console.log(chalk.green('\n✓ Dependencies installed\n'));
    console.log(chalk.cyan('🚀 Starting servers...\n'));

    // Start backend and frontend
    if (mode === 'development') {
      // Start backend in development mode
      const backend = spawn('yarn', ['dev:server'], { stdio: 'inherit' });
      
      // Start frontend in development mode
      const frontend = spawn('yarn', ['dev:client'], { stdio: 'inherit' });

      process.on('SIGINT', () => {
        backend.kill();
        frontend.kill();
        process.exit(0);
      });
    } else {
      // Build frontend
      console.log(chalk.yellow('Building frontend...'));
      const build = spawn('yarn', ['build'], { stdio: 'inherit' });
      await new Promise((resolve) => build.on('close', resolve));

      // Start in production mode
      const prod = spawn('yarn', ['start'], { stdio: 'inherit' });
      
      process.on('SIGINT', () => {
        prod.kill();
        process.exit(0);
      });
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to start web application'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

async function manageSnippets() {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      { name: 'List all snippets', value: 'list' },
      { name: 'Create new snippet', value: 'create' },
      { name: 'Search snippets', value: 'search' },
    ],
  });

  switch (action) {
    case 'list': {
      const spinner = ora('Loading snippets...').start();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
      spinner.stop();

      console.table([
        { id: 1, title: 'Auth Middleware', language: 'TypeScript', created: '2 days ago' },
        { id: 2, title: 'Database Connection', language: 'JavaScript', created: '1 week ago' },
        { id: 3, title: 'API Router', language: 'TypeScript', created: '3 weeks ago' },
      ]);
      break;
    }

    case 'create': {
      const { title, language } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Snippet title:' },
        {
          type: 'list',
          name: 'language',
          message: 'Select language:',
          choices: ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust'],
        },
      ]);
      console.log(chalk.green('✓') + ` Created snippet: ${chalk.cyan(title)} (${chalk.yellow(language)})`);
      break;
    }

    case 'search': {
      const { query } = await inquirer.prompt({
        type: 'input',
        name: 'query',
        message: 'Search query:',
      });
      console.log(chalk.yellow('🔍 Searching for:'), query);
      break;
    }
  }
}

async function main() {
  await showLogo();

  const { command } = await inquirer.prompt({
    type: 'list',
    name: 'command',
    message: 'What would you like to do?',
    choices: [
      { name: '🌐 Start Web Application', value: 'webapp' },
      { name: '📦 Create new project', value: 'project' },
      { name: '✨ Manage snippets', value: 'snippets' },
      { name: '📥 Manage dependencies', value: 'dependencies' },
      { name: '👥 Collaborate', value: 'collaborate' },
      { name: '⚙️  Settings', value: 'settings' },
      { name: '❌ Exit', value: 'exit' },
    ],
  });

  switch (command) {
    case 'webapp':
      await startWebApp();
      break;
    case 'project':
      await createProject();
      break;
    case 'snippets':
      await manageSnippets();
      break;
    case 'dependencies':
      await manageDependencies();
      break;
    case 'collaborate': {
      const { roomId } = await inquirer.prompt({
        type: 'input',
        name: 'roomId',
        message: 'Enter room ID to join:',
      });
      console.log(chalk.green('🤝 Joining collaboration room:'), roomId);
      break;
    }
    case 'settings':
      console.log(chalk.yellow('⚙️  Settings coming soon!'));
      break;
    case 'exit':
      console.log(chalk.gray('👋 Goodbye!'));
      process.exit(0);
  }

  const { again } = await inquirer.prompt({
    type: 'confirm',
    name: 'again',
    message: 'Would you like to do something else?',
    default: true,
  });

  if (again) {
    console.clear();
    await main();
  } else {
    console.log(chalk.gray('👋 Goodbye!'));
  }
}

// Start the CLI
if (process.argv[1] === import.meta.url.substring(7)) {
  try {
    await main();
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
} 