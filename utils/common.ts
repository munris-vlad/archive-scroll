export function random(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export const sleep = async (millis: number) => new Promise(resolve => setTimeout(resolve, millis))

export function shuffle(array: Array<string>) {
    let currentIndex = array.length,  randomIndex
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }

    return array
}