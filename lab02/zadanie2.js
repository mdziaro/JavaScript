'use strict';

function sum(x,y) {
    return x+y;
}

function sum_strings(a) {
    return a.reduce((sum, str) => {
        const num = parseFloat(str);
        return isNaN(num) ? sum : sum + num;
    }, 0);
}

function digits(s) {
    const oddSum = Array.from(s).reduce((sum, char) => {
        const digit = parseInt(char);
        return isNaN(digit) ? sum : digit % 2 === 1 ? sum + digit : sum;
    }, 0);

    const evenSum = Array.from(s).reduce((sum, char) => {
        const digit = parseInt(char);
        return isNaN(digit) ? sum : digit % 2 === 0 ? sum + digit : sum;
    }, 0);

    return [oddSum, evenSum];
}

function letters(s) {
    const lowercaseCount = Array.from(s).reduce((count, char) => {
        return /[a-z]/.test(char) ? count + 1 : count;
    }, 0);

    const uppercaseCount = Array.from(s).reduce((count, char) => {
        return /[A-Z]/.test(char) ? count + 1 : count;
    }, 0);

    return [lowercaseCount, uppercaseCount];
}