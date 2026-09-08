
function calculateAverage(totals, count) {
    // BUG: Division by Zero
    // If count is 0, this will result in a runtime exception / Infinity.
    return totals / count;
}

function badOperatorPrecedence() {
    let base = 100;
    let tax = 5;
    let fee = 10;
    // BUG: Incorrect Operator Precedence
    // Expected logic: multiply base by (tax + fee). 
    // Actual logic: base * tax + fee = 100 * 5 + 10 = 510.
    let totalTax = base * tax + fee; 
    return totalTax;
}

function processLargeNumbers() {
    // Notice: JS uses floating point for numbers, but imagine this was typed correctly 
    // or run in a system where max int is exceeded. The LLM should pick up on logical overflows.
    let maxItems = 2147483647; // Max 32-bit integer
    
    // BUG: Integer Overflow
    let totalItems = maxItems + 10; 
    console.log(totalItems);
}

function precisionLoss() {
    let intVal = 5;
    let floatVal = 2.5;

    // BUG: Precision Loss / Incorrect formula logic
    // Assigning the division result to a system expecting strict integers
    // or logically losing expected remainder.
    let result = intVal / floatVal; 
    console.log("Result is", result);
}
