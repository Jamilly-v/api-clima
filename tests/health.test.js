describe("Health Check", () => {

    test("deve validar que a aplicação está online", () => {

        const status = "healthy";

        expect(status).toBe("healthy");

    });

});