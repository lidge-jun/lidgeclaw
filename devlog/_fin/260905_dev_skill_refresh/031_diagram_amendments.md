# wp3 — A audit amendments

Dependency: owning decade plan. These exact edits run AFTER its original operations.

## MODIFY plugins/cursorclaw/test/visualize-inspection.test.mjs

Before:

`````text
    writeFileSync(tracking, '- Current SHA-256: `invalid`\n');
`````

After:

`````text
    const defaultRoot = join(root, 'codex-home');
    const homeRoot = join(root, 'home');
    for (const [base, version] of [[defaultRoot, '2.0.0'], [join(homeRoot, '.codex'), '3.0.0']]) {
      const dir = join(base, 'plugins', 'cache', 'openai-bundled', 'visualize', version, 'skills', 'visualize');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'SKILL.md'), 'current-contract');
    }
    // Explicit override still wins over a populated, different CURSOR_HOME.
    result = run({ CURSOR_HOME: defaultRoot, HOME: homeRoot });
    assert.equal(result.status, 1);
    assert.match(result.stdout, /1\.0\.11/);
    for (const override of ['', undefined]) {
      result = run({ CXC_VISUALIZE_ROOT: override, CURSOR_HOME: defaultRoot, HOME: homeRoot });
      assert.equal(result.status, 0);
      assert.match(result.stdout, /version 2\.0\.0/);
    }
    for (const codexHome of ['', undefined]) {
      result = run({ CXC_VISUALIZE_ROOT: undefined, CURSOR_HOME: codexHome, HOME: homeRoot });
      assert.equal(result.status, 0);
      assert.match(result.stdout, /version 3\.0\.0/);
    }
    writeFileSync(tracking, '- Current SHA-256: `invalid`\n');
`````
