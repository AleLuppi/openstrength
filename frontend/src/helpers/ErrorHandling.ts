class ErrorHandling {
  onSuccess: Function = (succ: string) => {
    console.log(succ);
  };
  onError: Function = (err: string) => {
    console.log(err);
  };
}
