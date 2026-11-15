/** Configuración temporal de Jest para la actividad Tester vs. IA. */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/testing-temporal/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          target: "ES2022",
          esModuleInterop: true
        }
      }
    ]
  }
};
