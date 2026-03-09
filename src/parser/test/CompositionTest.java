public class Engine {
    private int horsepower;

    public Engine() {
    }
}

public class Wheel {
    private int size;
}

public class Car {
    private Engine engine;
    public Wheel[] wheels;
    protected String model;
}