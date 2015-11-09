class Greeter {
    constructor(public greeting: string) { }
    greet() {
        return "<h1>" + this.greeting + "</h1>";
    }
};

document.body.innerHTML = "test";

var greeter = new Greeter("Hello, world!");

document.body.innerHTML = greeter.greet();
