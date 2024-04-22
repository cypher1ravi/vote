let str = "abc abc abc"
for (let words in str) {
    if (words % 2 === 0) {
        console.log(str[words]);
    }
}