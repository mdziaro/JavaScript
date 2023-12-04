
var expect = chai.expect;
describe('The sum() function', function() {
  it('returns 4 for 2+2', function() {
    expect(sum(2,2)).to.equal(4);
  });
  it('returns 0 for -2+2', function() {
    expect(sum(-2,2)).to.equal(0);
  });
});

describe("Task 2", function () {
    describe("When the array contains strings", function () {
        it("the sum_strings() function should return the sum of those strings that are numbers or begin with a sequence of digits", function () {
            const a = ["123", "146a2B", "", "b3345a", "\t"];
            const expectedRes = 269;
            const res = sum_strings(a);
            expect(res).to.equal(expectedRes);
        });
    });
    describe("When the array is empty", function () {
        it("the sum_strings() function should return 0", function () {
            const a = [];
            const expectedRes = 0;
            const res = sum_strings(a);
            expect(res).to.equal(expectedRes);
        });
    });    
    describe("When the string contains only digits", function () {
        it("the 'digits()' function should return an array with the sum of odd and even digits", function () {
            const s = "123";
            const expectedRes = [4, 2];
            const res = digits(s);
            expect(res).to.deep.equal(expectedRes);
        });
        it("the 'letters()' function should return [0, 0]", function () {
            const s = "123";
            const expectedRes = [0, 0];
            const res = letters(s);
            expect(res).to.deep.equal(expectedRes);
        });

    });

    describe("When the string contains only letters", function () {
        it("the 'digits()' function should return [0, 0]", function () {
            const s = "aBc";
            const expectedRes = [0, 0];
            const res = digits(s);
            expect(res).to.deep.equal(expectedRes);
        });
        it("the 'letters()' function should return an array with the number of lowercase and uppercase letters", function () {
            const s = "aBc";
            const expectedRes = [2, 1];
            const res = letters(s);
            expect(res).to.deep.equal(expectedRes);
        });
    });

    describe("When the string contains letters followed by digits", function () {
        it("the 'digits()' function should return an array with the sum of the odd and even digits", function () {
            const s = "aB123";
            const expectedRes = [4, 2];
            const res = digits(s);
            expect(res).to.deep.equal(expectedRes);
        });
        it("the 'letters()' function should return an array with the number of lowercase and uppercase letters", function () {
            const s = "aB123";
            const expectedRes = [1, 1];
            const res = letters(s);
            expect(res).to.deep.equal(expectedRes);
        });
    });

    describe("When the string contains digits followed by letters", function () {
        it("the 'digits()' function should return an array with the sum of the odd and even digits", function () {
            const s = "123aB";
            const expectedRes = [4, 2];
            const res = digits(s);
            expect(res).to.deep.equal(expectedRes);
        });
        it("the 'letters()' function should return an array with the number of lowercase and uppercase letters", function () {
            const s = "123aB";
            const expectedRes = [1, 1];
            const res = letters(s);
            expect(res).to.deep.equal(expectedRes);
        });
    });

    describe("When the string is empty", function () {
        it("the 'digits()' function should return [0, 0]", function () {
            const s = "";
            const expectedRes = [0, 0];
            const res = digits(s);
            expect(res).to.deep.equal(expectedRes);
        });
        it("the 'letters()' function should return [0, 0]", function () {
            const s = "";
            const expectedRes = [0, 0];
            const res = letters(s);
            expect(res).to.deep.equal(expectedRes);
        });
    });
});