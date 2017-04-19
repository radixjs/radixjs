function* launchTestsHook() {
    console.log(radix.globals.WORKER.id + " [-] Executing Radix test hook");
    yield* hooks_tests();
    console.log(radix.globals.WORKER.id + " [-] Radix test hook executed");
}
