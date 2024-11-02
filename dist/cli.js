import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
const VERSION = "1.0.0";
async function showLogo() {
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
async function createProject() {
    const spinner = ora();
    try {
        const { projectName } = await inquirer.prompt({
            type: 'input',
            name: 'projectName',
            message: 'Project name:',
            validate: (value) => value.trim().length >= 2,
        });
        const { projectType } = await inquirer.prompt({
            type: 'list',
            name: 'projectType',
            message: 'Select project type:',
            choices: [
                { name: 'Web Application', value: 'web' },
                { name: 'API Service', value: 'api' },
                { name: 'Library', value: 'lib' },
            ],
        });
        const { useTypeScript } = await inquirer.prompt({
            type: 'confirm',
            name: 'useTypeScript',
            message: 'Use TypeScript?',
            default: true,
        });
        spinner.start('Creating project...');
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate work
        spinner.succeed('Project created successfully!');
        console.log('\n' + chalk.green('✓') + ' Project details:');
        console.table({
            Name: chalk.cyan(projectName),
            Type: chalk.yellow(projectType),
            TypeScript: useTypeScript ? chalk.green('Yes') : chalk.red('No'),
        });
    }
    catch (error) {
        if (error instanceof Error) {
            spinner.fail(chalk.red('Failed to create project: ' + error.message));
        }
        else {
            spinner.fail(chalk.red('Failed to create project'));
        }
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
            { name: '📦 Create new project', value: 'project' },
            { name: '✨ Manage snippets', value: 'snippets' },
            { name: '👥 Collaborate', value: 'collaborate' },
            { name: '⚙️  Settings', value: 'settings' },
            { name: '❌ Exit', value: 'exit' },
        ],
    });
    switch (command) {
        case 'project':
            await createProject();
            break;
        case 'snippets':
            await manageSnippets();
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
    }
    else {
        console.log(chalk.gray('👋 Goodbye!'));
    }
}
// Start the CLI
if (process.argv[1] === import.meta.url.substring(7)) {
    try {
        await main();
    }
    catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    }
}
