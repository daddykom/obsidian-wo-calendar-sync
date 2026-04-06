var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WeekCalendartPlugin_internalWrites, _WeekCalendartPlugin_pendingSyncs;
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Notice, Plugin, TFile } from 'obsidian';
class WeekCalendartPlugin extends Plugin {
    constructor() {
        super(...arguments);
        _WeekCalendartPlugin_internalWrites.set(this, new Set());
        _WeekCalendartPlugin_pendingSyncs.set(this, new Map());
    }
    onload() {
        this.registerModifyPipeline();
    }
    onunload() {
        for (const timeoutId of __classPrivateFieldGet(this, _WeekCalendartPlugin_pendingSyncs, "f").values()) {
            window.clearTimeout(timeoutId);
        }
        __classPrivateFieldGet(this, _WeekCalendartPlugin_pendingSyncs, "f").clear();
        __classPrivateFieldGet(this, _WeekCalendartPlugin_internalWrites, "f").clear();
    }
    registerModifyPipeline() {
        const vaultEmitter = this.app.vault;
        const subscription = fromEvent(vaultEmitter, 'modify')
            .pipe(filter((file) => file instanceof TFile), filter((file) => file.extension === 'md'), filter((file) => !__classPrivateFieldGet(this, _WeekCalendartPlugin_internalWrites, "f").has(file.path)))
            .subscribe((file) => {
            this.scheduleEnsureLocalIdsAndSync(file);
        });
        this.register(() => subscription.unsubscribe());
    }
    scheduleEnsureLocalIdsAndSync(file) {
        const existingTimeoutId = __classPrivateFieldGet(this, _WeekCalendartPlugin_pendingSyncs, "f").get(file.path);
        if (existingTimeoutId !== undefined) {
            window.clearTimeout(existingTimeoutId);
        }
        const timeoutId = window.setTimeout(() => {
            __classPrivateFieldGet(this, _WeekCalendartPlugin_pendingSyncs, "f").delete(file.path);
            void this.ensureLocalIdsAndSync(file.path).catch((error) => {
                console.error('[week-calendart] modify pipeline failed', error);
                new Notice('Week Calendart: Verarbeitung fehlgeschlagen (siehe Konsole)');
            });
        }, 3000);
        __classPrivateFieldGet(this, _WeekCalendartPlugin_pendingSyncs, "f").set(file.path, timeoutId);
    }
    async ensureLocalIdsAndSync(path) {
        const currentFile = this.app.vault.getAbstractFileByPath(path);
        if (!(currentFile instanceof TFile)) {
            return;
        }
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile?.path === currentFile.path) {
            this.scheduleEnsureLocalIdsAndSync(currentFile);
            return;
        }
        const originalContent = await this.app.vault.read(currentFile);
        const updatedContent = this.ensureLocalIdsInContent(originalContent);
        if (updatedContent !== originalContent) {
            await this.writeInternal(currentFile, updatedContent);
        }
        await this.syncFile(currentFile);
    }
    async writeInternal(file, content) {
        __classPrivateFieldGet(this, _WeekCalendartPlugin_internalWrites, "f").add(file.path);
        try {
            await this.app.vault.modify(file, content);
        }
        finally {
            window.setTimeout(() => {
                __classPrivateFieldGet(this, _WeekCalendartPlugin_internalWrites, "f").delete(file.path);
            }, 0);
        }
    }
    async syncFile(file) {
        console.log('[week-calendart] sync', file.path);
    }
    ensureLocalIdsInContent(content) {
        const lines = content.split('\n');
        const result = [];
        let insideEvent = false;
        let block = [];
        const flushBlock = () => {
            if (block.length === 0) {
                return;
            }
            const hasLocalId = block.some((line) => line.trimStart().startsWith('localId:'));
            if (!hasLocalId) {
                block.push(`  localId: ${crypto.randomUUID()}`);
            }
            result.push(...block);
            block = [];
        };
        for (const line of lines) {
            if (/^#\s/.test(line)) {
                flushBlock();
                insideEvent = false;
                result.push(line);
                continue;
            }
            if (line.startsWith('- ')) {
                flushBlock();
                insideEvent = true;
                block = [line];
                continue;
            }
            if (insideEvent) {
                if (line.trim() === '') {
                    flushBlock();
                    insideEvent = false;
                    result.push(line);
                    continue;
                }
                block.push(line);
                continue;
            }
            result.push(line);
        }
        flushBlock();
        return result.join('\n');
    }
}
_WeekCalendartPlugin_internalWrites = new WeakMap(), _WeekCalendartPlugin_pendingSyncs = new WeakMap();
export default WeekCalendartPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1ldmVudC1lbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZS1ldmVudC1lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDakMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFpQixLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFPaEUsTUFBcUIsbUJBQW9CLFNBQVEsTUFBTTtJQUF2RDs7UUFDVyw4Q0FBa0IsSUFBSSxHQUFHLEVBQVUsRUFBQztRQUNwQyw0Q0FBZ0IsSUFBSSxHQUFHLEVBQWtCLEVBQUM7SUFxSnJELENBQUM7SUFuSlUsTUFBTTtRQUNiLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFUSxRQUFRO1FBQ2YsS0FBSyxNQUFNLFNBQVMsSUFBSSx1QkFBQSxJQUFJLHlDQUFjLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUNwRCxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCx1QkFBQSxJQUFJLHlDQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsdUJBQUEsSUFBSSwyQ0FBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU8sc0JBQXNCO1FBQzVCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FHN0IsQ0FBQztRQUVGLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBZ0IsWUFBWSxFQUFFLFFBQVEsQ0FBQzthQUNsRSxJQUFJLENBQ0gsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFpQixFQUFFLENBQUMsSUFBSSxZQUFZLEtBQUssQ0FBQyxFQUN0RCxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FB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LElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUN0QixVQUFVLEVBQUUsQ0FBQztnQkFDYixXQUFXLEdBQUcsS0FBSyxDQUFDO2dCQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixTQUFTO1lBQ1gsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUMxQixVQUFVLEVBQUUsQ0FBQztnQkFDYixXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUNuQixLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDZixTQUFTO1lBQ1gsQ0FBQztZQUVELElBQUksV0FBVyxFQUFFLENBQUM7Z0JBQ2hCLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO29CQUN2QixVQUFVLEVBQUUsQ0FBQztvQkFDYixXQUFXLEdBQUcsS0FBSyxDQUFDO29CQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsQixTQUFTO2dCQUNYLENBQUM7Z0JBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakIsU0FBUztZQUNYLENBQUM7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFFRCxVQUFVLEVBQUUsQ0FBQztRQUViLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBQ0Y7O2VBdkpvQixtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmcm9tRXZlbnQgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE5vdGljZSwgUGx1Z2luLCBUQWJzdHJhY3RGaWxlLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcblxudHlwZSBKUXVlcnlTdHlsZUV2ZW50RW1pdHRlcjxUQ29udGV4dCwgVEV2ZW50PiA9IHtcbiAgb24obmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBURXZlbnQpID0+IHVua25vd24sIGN0eD86IFRDb250ZXh0KTogdW5rbm93bjtcbiAgb2ZmKG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogVEV2ZW50KSA9PiB1bmtub3duKTogdW5rbm93bjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlZWtDYWxlbmRhcnRQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICByZWFkb25seSAjaW50ZXJuYWxXcml0ZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcmVhZG9ubHkgI3BlbmRpbmdTeW5jcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cbiAgb3ZlcnJpZGUgb25sb2FkKCk6IHZvaWQge1xuICAgIHRoaXMucmVnaXN0ZXJNb2RpZnlQaXBlbGluZSgpO1xuICB9XG5cbiAgb3ZlcnJpZGUgb251bmxvYWQoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCB0aW1lb3V0SWQgb2YgdGhpcy4jcGVuZGluZ1N5bmNzLnZhbHVlcygpKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgdGhpcy4jcGVuZGluZ1N5bmNzLmNsZWFyKCk7XG4gICAgdGhpcy4jaW50ZXJuYWxXcml0ZXMuY2xlYXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJNb2RpZnlQaXBlbGluZSgpOiB2b2lkIHtcbiAgICBjb25zdCB2YXVsdEVtaXR0ZXIgPSB0aGlzLmFwcC52YXVsdCBhcyB1bmtub3duIGFzIEpRdWVyeVN0eWxlRXZlbnRFbWl0dGVyPFxuICAgICAgdW5rbm93bixcbiAgICAgIFRBYnN0cmFjdEZpbGVcbiAgICA+O1xuXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gZnJvbUV2ZW50PFRBYnN0cmFjdEZpbGU+KHZhdWx0RW1pdHRlciwgJ21vZGlmeScpXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKChmaWxlKTogZmlsZSBpcyBURmlsZSA9PiBmaWxlIGluc3RhbmNlb2YgVEZpbGUpLFxuICAgICAgICBmaWx0ZXIoKGZpbGUpID0+IGZpbGUuZXh0ZW5zaW9uID09PSAnbWQnKSxcbiAgICAgICAgZmlsdGVyKChmaWxlKSA9PiAhdGhpcy4jaW50ZXJuYWxXcml0ZXMuaGFzKGZpbGUucGF0aCkpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoZmlsZSkgPT4ge1xuICAgICAgICB0aGlzLnNjaGVkdWxlRW5zdXJlTG9jYWxJZHNBbmRTeW5jKGZpbGUpO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyKCgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVFbnN1cmVMb2NhbElkc0FuZFN5bmMoZmlsZTogVEZpbGUpOiB2b2lkIHtcbiAgICBjb25zdCBleGlzdGluZ1RpbWVvdXRJZCA9IHRoaXMuI3BlbmRpbmdTeW5jcy5nZXQoZmlsZS5wYXRoKTtcblxuICAgIGlmIChleGlzdGluZ1RpbWVvdXRJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KGV4aXN0aW5nVGltZW91dElkKTtcbiAgICB9XG5cbiAgICBjb25zdCB0aW1lb3V0SWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLiNwZW5kaW5nU3luY3MuZGVsZXRlKGZpbGUucGF0aCk7XG5cbiAgICAgIHZvaWQgdGhpcy5lbnN1cmVMb2NhbElkc0FuZFN5bmMoZmlsZS5wYXRoKS5jYXRjaCgoZXJyb3I6IHVua25vd24pID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW3dlZWstY2FsZW5kYXJ0XSBtb2RpZnkgcGlwZWxpbmUgZmFpbGVkJywgZXJyb3IpO1xuICAgICAgICBuZXcgTm90aWNlKCdXZWVrIENhbGVuZGFydDogVmVyYXJiZWl0dW5nIGZlaGxnZXNjaGxhZ2VuIChzaWVoZSBLb25zb2xlKScpO1xuICAgICAgfSk7XG4gICAgfSwgMzAwMCk7XG5cbiAgICB0aGlzLiNwZW5kaW5nU3luY3Muc2V0KGZpbGUucGF0aCwgdGltZW91dElkKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlTG9jYWxJZHNBbmRTeW5jKHBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGN1cnJlbnRGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gICAgaWYgKCEoY3VycmVudEZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVGaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcblxuICAgIGlmIChhY3RpdmVGaWxlPy5wYXRoID09PSBjdXJyZW50RmlsZS5wYXRoKSB7XG4gICAgICB0aGlzLnNjaGVkdWxlRW5zdXJlTG9jYWxJZHNBbmRTeW5jKGN1cnJlbnRGaWxlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW5hbENvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGN1cnJlbnRGaWxlKTtcbiAgICBjb25zdCB1cGRhdGVkQ29udGVudCA9IHRoaXMuZW5zdXJlTG9jYWxJZHNJbkNvbnRlbnQob3JpZ2luYWxDb250ZW50KTtcblxuICAgIGlmICh1cGRhdGVkQ29udGVudCAhPT0gb3JpZ2luYWxDb250ZW50KSB7XG4gICAgICBhd2FpdCB0aGlzLndyaXRlSW50ZXJuYWwoY3VycmVudEZpbGUsIHVwZGF0ZWRDb250ZW50KTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnN5bmNGaWxlKGN1cnJlbnRGaWxlKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgd3JpdGVJbnRlcm5hbChmaWxlOiBURmlsZSwgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy4jaW50ZXJuYWxXcml0ZXMuYWRkKGZpbGUucGF0aCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIGNvbnRlbnQpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuI2ludGVybmFsV3JpdGVzLmRlbGV0ZShmaWxlLnBhdGgpO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzeW5jRmlsZShmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnNvbGUubG9nKCdbd2Vlay1jYWxlbmRhcnRdIHN5bmMnLCBmaWxlLnBhdGgpO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVMb2NhbElkc0luQ29udGVudChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3QgcmVzdWx0OiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgbGV0IGluc2lkZUV2ZW50ID0gZmFsc2U7XG4gICAgbGV0IGJsb2NrOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgY29uc3QgZmx1c2hCbG9jayA9ICgpOiB2b2lkID0+IHtcbiAgICAgIGlmIChibG9jay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBoYXNMb2NhbElkID0gYmxvY2suc29tZSgobGluZSkgPT4gbGluZS50cmltU3RhcnQoKS5zdGFydHNXaXRoKCdsb2NhbElkOicpKTtcblxuICAgICAgaWYgKCFoYXNMb2NhbElkKSB7XG4gICAgICAgIGJsb2NrLnB1c2goYCAgbG9jYWxJZDogJHtjcnlwdG8ucmFuZG9tVVVJRCgpfWApO1xuICAgICAgfVxuXG4gICAgICByZXN1bHQucHVzaCguLi5ibG9jayk7XG4gICAgICBibG9jayA9IFtdO1xuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmICgvXiNcXHMvLnRlc3QobGluZSkpIHtcbiAgICAgICAgZmx1c2hCbG9jaygpO1xuICAgICAgICBpbnNpZGVFdmVudCA9IGZhbHNlO1xuICAgICAgICByZXN1bHQucHVzaChsaW5lKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0gJykpIHtcbiAgICAgICAgZmx1c2hCbG9jaygpO1xuICAgICAgICBpbnNpZGVFdmVudCA9IHRydWU7XG4gICAgICAgIGJsb2NrID0gW2xpbmVdO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGluc2lkZUV2ZW50KSB7XG4gICAgICAgIGlmIChsaW5lLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgICAgICBmbHVzaEJsb2NrKCk7XG4gICAgICAgICAgaW5zaWRlRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgICByZXN1bHQucHVzaChsaW5lKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJsb2NrLnB1c2gobGluZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICByZXN1bHQucHVzaChsaW5lKTtcbiAgICB9XG5cbiAgICBmbHVzaEJsb2NrKCk7XG5cbiAgICByZXR1cm4gcmVzdWx0LmpvaW4oJ1xcbicpO1xuICB9XG59XG4iXX0=