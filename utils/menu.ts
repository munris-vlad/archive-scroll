import inquirer from "inquirer"

export const entryPoint = async () => {
    const questions = [
        {
            name: "choice",
            type: "list",
            message: "Действие:",
            choices: [
                {
                    name: "Custom module",
                    value: "custom",
                },
                {
                    name: "Random module",
                    value: "random",
                },
                {
                    name: "Random swap module",
                    value: "random_swap",
                },
                {
                    name: "Bridge",
                    value: "bridge",
                },
                {
                    name: "Orbiter",
                    value: "orbiter",
                },
                {
                    name: "Merkly",
                    value: "merkly",
                },
                {
                    name: "Scrollswap",
                    value: "scrollswap",
                },
                {
                    name: "Deploy",
                    value: "deploy",
                },
                {
                    name: "Swap all stables to ETH",
                    value: "stable_to_eth",
                },
            ],
            loop: false,
        },
    ]

    const answers = await inquirer.prompt(questions)
    return answers.choice
}