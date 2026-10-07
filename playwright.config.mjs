import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',timeout:30000,workers:1,
 use:{baseURL:process.env.APPBASS_TEST_URL||'http://127.0.0.1:3100',headless:true,
   launchOptions:{channel:'msedge'}},
 outputDir:'outputs/browser-results',reporter:'list'
});
