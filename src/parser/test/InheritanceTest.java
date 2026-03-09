public abstract class Mammal {
    private int eyeColour;

    public Mammal() {
    }

    public int getEyeColour() {
        return eyeColour;
    }

    public abstract String makeSound();
}

class Dog extends Mammal {
    private int barkFrequency;

    public Dog() {
    }

    public void bark() {
    }

    public String makeSound() {
        return "Woof";
    }
}

class GermanShepherd extends Dog {
    public void isGerman() {
    }
}

class Poodle extends Dog {
    public void isFrench() {
    }
}