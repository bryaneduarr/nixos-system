export function createGate() {
  let open = () => {};
  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });

  return { opened, open: () => open() };
}
