
function solution(A, B) {
    console.log(`Variable A: ${A} | Variable B: ${B}`);
    if (A === B){
        return 0;
    }

    if (A > B){
        return -1;
    }

    let arrayA = ('' + A).split('');
    let sizeA = arrayA.length;
    console.log('size of A: ' + sizeA);

    let arrayB = ('' + B).split('');
    let count = 0;
    let spliceCount = 0;
    console.log(arrayB.length)
    while (true) {
        if (count/sizeA >= arrayB.length) {
            count = 0;
            spliceCount++;
            arrayB = ('' + B).split('');
        }
        console.log('spliceCount ' + spliceCount)
        console.log('count ' + count)
        console.log('arrayB' + arrayB)
        let sectionOfB = arrayB.splice(spliceCount, sizeA);
        console.log('sectionOfB:' + sectionOfB);
        let smashedB = sectionOfB.reduce((prev, current) => {
            return prev+current
        }, '');
        console.log('smashedB: ' +smashedB)
        if ('' + A === smashedB) {
            return (count * sizeA) + spliceCount;
        } else {
            count++;
        }

        if (spliceCount > arrayB.length) {
            console.log('exiting...');
            return -1;
        }
    }
    return -1;
}
