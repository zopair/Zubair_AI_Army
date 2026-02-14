
    export const securityGuard = {
      authorizedUser: "Prince Sultan",
      accessLevel: "SOVEREIGN",
      validate: (user: string) => user === "Prince Sultan"
    };
    