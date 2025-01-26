export const validateRouteParams = (params: any, requiredParams: string[]): boolean => {
    if (!params) return false;
    for (const param of requiredParams) {
      if (!params.hasOwnProperty(param) || params[param] === undefined || params[param] === null) {
        console.error(`Missing or invalid parameter: ${param}`);
        return false;
      }
    }
    return true;
  };  