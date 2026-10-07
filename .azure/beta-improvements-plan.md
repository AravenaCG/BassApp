# Beta improvements — approved 2026-10-06

Scope: complete accounts/profile/logout/password change, personalized home and resume,
atomic lesson progress and referral attribution, lesson read/review states, journal,
weekly in-app reminders, feedback, quizzes, and selectable synchronized practices.

Practice: course MusicXML materials plus original beginner pieces; Web Audio synthesis
from a shared note timeline, variable tempo, section loops, progressive tempo, guide toggle,
instrument selection, difficulty variants, persisted preferences, accessible controls.

Data: additive migrations only in AppbassBeta. No changes to UsuariosOESAT.
Email delivery and password-reset email remain deferred by user. No new paid services.
Keep Azure SQL secrets in Azure. Verify tests/build/browser and deployment before handoff.

Status: implemented, deployed and verified on the public endpoint.

Evidence: five study/score unit tests, TypeScript check, production build, four Edge browser
tests (desktop/mobile), real SQL integration with temporary accounts and fixture cleanup.
Migration applied only in AppbassBeta. No write to UsuariosOESAT.

Deployment: 94de70a3bf31b6d9fa7b88077c9f97d8a450078a; GitHub run 37558924199 succeeded;
Azure revision appbass--0000010 Healthy. Public browser tests 4/4 (mocked API), separate real
public API + SQL integration passed; temporary test data cleaned. Historical D1 test also passes.
