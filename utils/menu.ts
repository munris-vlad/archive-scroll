import inquirer from "inquirer"

export const entryPoint = async () => {
    const questions = [
        {
            name: "choice",
            type: "list",
            message: "Действие:",
            choices: [
                {
                    name: "Merkly",
                    value: "merkly",
                },
                {
                    name: "Deploy",
                    value: "deploy",
                }
            ],
            loop: false,
        },
    ]

    const answers = await inquirer.prompt(questions)
    return answers.choice
}