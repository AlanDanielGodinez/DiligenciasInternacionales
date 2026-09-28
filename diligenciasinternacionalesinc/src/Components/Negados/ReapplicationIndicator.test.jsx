import { getReapplicationStatus } from './ReapplicationIndicator';

const today=new Date(2026,8,22);
test('marks less than ten months as not ready',()=>expect(getReapplicationStatus('2026-01-22',today).tone).toBe('danger'));
test('marks ten to eleven months for follow-up',()=>expect(getReapplicationStatus('2025-11-22',today).tone).toBe('warning'));
test('marks twelve months or more as possible reapplication',()=>expect(getReapplicationStatus('2025-09-22',today).tone).toBe('success'));
