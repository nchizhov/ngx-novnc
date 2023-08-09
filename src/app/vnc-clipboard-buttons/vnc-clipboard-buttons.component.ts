import {Component, Input, OnDestroy, OnInit} from '@angular/core';
// @ts-ignore
import RFB from "@novnc/novnc/core/rfb.js";
import {MessageService} from 'primeng/api';
import {Clipboard} from '@angular/cdk/clipboard';

import {vncBufferDecode, vncBufferEncode} from '../funcs';
import {getToastMessage} from '../toast-messages';

@Component({
  selector: 'app-vnc-clipboard-buttons',
  templateUrl: './vnc-clipboard-buttons.component.html',
  styleUrls: ['./vnc-clipboard-buttons.component.scss']
})
export class VncClipboardButtonsComponent implements OnInit, OnDestroy {
  @Input() rfb!: RFB;
  @Input() isView!: boolean;
  @Input() isConnected!: boolean;
  @Input() remoteClipboard!: string | null;

  localClipboard: boolean = true;
  private permissionsStatus!: PermissionStatus;

  constructor(private messageService: MessageService,
              private clipboard: Clipboard) {}

  ngOnInit() {
    this.getClipboardPermissions();
  }

  ngOnDestroy() {
    if (this.permissionsStatus) {
      this.permissionsStatus.removeEventListener('change', this.onClipboardPermission);
    }
  }

  onGetClipboard(): void {
    if (!this.rfb || !this.remoteClipboard) {
      return;
    }
    this.clipboard.copy(vncBufferEncode(this.remoteClipboard));
    this.messageService.add(getToastMessage('clipboard_get'));
  }

  onSendClipboard(): void {
    if (!this.rfb || !this.localClipboard) {
      return;
    }
    navigator.clipboard.readText()
      .then((clipboardText: string) => {
        this.rfb.clipboardPasteFrom(vncBufferDecode(clipboardText));
      })
      .catch((reason: any) => this.messageService.add(getToastMessage('clipboard_disabled', reason)));
  }

  private getClipboardPermissions(): void {
    const queryOpts: {[s: string]: any} = {
      name: 'clipboard-read',
      allowWithoutGesture: false
    };
    // @ts-ignore
    const clipboardPermissions: Promise<PermissionStatus> = navigator.permissions.query(queryOpts);
    clipboardPermissions.then((status: PermissionStatus) => {
      this.permissionsStatus = status;
      this.onClipboardPermission();
      status.addEventListener('change', this.onClipboardPermission.bind(this));
    })
      .catch(() => this.localClipboard = false);
  }

  private onClipboardPermission(): void {
    this.localClipboard = this.permissionsStatus.state !== 'denied';
  }
}
