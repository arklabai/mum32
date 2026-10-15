import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { PromptSynthesizer } from '../src/PromptSynthesizer';

describe('PromptSynthesizer.sanitize', () => {
  it('should redact OpenAI legacy and project-scoped API keys', () => {
    const raw = 'OpenAI: sk-proj-1234567890abcdef1234567890abcdef12 and sk-1234567890abcdef1234567890';
    const cleaned = PromptSynthesizer.sanitize(raw);
    assert.doesNotMatch(cleaned, /sk-proj-/);
    assert.doesNotMatch(cleaned, /sk-1234/);
    assert.match(cleaned, /\[REDACTED_API_KEY\]/);
  });

  it('should redact Anthropic API keys', () => {
    const raw = 'Anthropic: sk-ant-api03-abcdef1234567890-abcdef1234567890';
    const cleaned = PromptSynthesizer.sanitize(raw);
    assert.doesNotMatch(cleaned, /sk-ant-/);
    assert.match(cleaned, /\[REDACTED_API_KEY\]/);
  });

  it('should redact AWS Access Key IDs', () => {
    const raw = 'AWS Key: AKIAIOSFODNN7EXAMPLE';
    const cleaned = PromptSynthesizer.sanitize(raw);
    assert.doesNotMatch(cleaned, /AKIAIOSFODNN7EXAMPLE/);
    assert.match(cleaned, /\[REDACTED_AWS_KEY\]/);
  });

  it('should redact GitHub Personal Access Tokens and Fine-Grained tokens', () => {
    const raw = 'GH: ghp_123456789012345678901234567890123456 and github_pat_11AEXAMPLE1234567890';
    const cleaned = PromptSynthesizer.sanitize(raw);
    assert.doesNotMatch(cleaned, /ghp_1234/);
    assert.doesNotMatch(cleaned, /github_pat_/);
    assert.match(cleaned, /\[REDACTED_GH_TOKEN\]/);
  });

  it('should redact RSA and EC Private Keys', () => {
    const raw = `
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7V3D9EkO...
-----END PRIVATE KEY-----
    `;
    const cleaned = PromptSynthesizer.sanitize(raw);
    assert.doesNotMatch(cleaned, /MIIEvgIBADANBgkqhkiG/);
    assert.match(cleaned, /\[REDACTED_PRIVATE_KEY\]/);
  });
});
