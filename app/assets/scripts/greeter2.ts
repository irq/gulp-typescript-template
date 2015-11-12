class Greeter2 {
    constructor(public greeting: string) { }
    greet() {
        return "<h1>!" + this.greeting + "!</h1>";
    }
};

var greeter2 = new Greeter2("Hello, world!2");

document.body.innerHTML += greeter2.greet();
