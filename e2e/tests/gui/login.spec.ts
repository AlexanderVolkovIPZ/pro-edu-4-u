import { guiTest as test } from '../../src/fixtures';
import { loginCases, tags } from '../../src/data/DataProvider';

// AT-01. Sign-in with email and password (DDT: login.json)
for (const c of loginCases()) {
  test(`AT-01 ${c.id} [${c.set}] login: ${c.title} ${tags('@gui', '@regression', c.smoke && '@smoke')}`, async ({ loginPage, header }) => {
    await loginPage.open();
    await loginPage.login(c.email, c.password);

    if (c.expect === 'success') {
      await header.expectLoggedIn();
    } else {
      await loginPage.expectError();
      await header.expectLoggedOut();
    }
  });
}
