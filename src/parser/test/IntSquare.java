public class IntSquare {
    private int squareValue;

    public IntSquare() {
        squareValue = 0;
    }

    public int getSquare(int value) {
        return calculateSquare(value);
    }

    private int calculateSquare(int value) {
        return value * value;
    }
}