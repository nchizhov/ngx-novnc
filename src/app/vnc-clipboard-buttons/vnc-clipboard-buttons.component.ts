import {Component, OnDestroy, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import {Clipboard} from '@angular/cdk/clipboard';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

import {vncBufferDecode, vncBufferEncode} from '../funcs';
import {getToastMessage} from '../toast-messages';
import {VncService} from '../vnc.service';

@UntilDestroy()
@Component({
  selector: 'app-vnc-clipboard-buttons',
  templateUrl: './vnc-clipboard-buttons.component.html',
  styleUrls: ['./vnc-clipboard-buttons.component.scss']
})
export class VncClipboardButtonsComponent implements OnInit, OnDestroy {
  private isConnected!: boolean;
  private isView!: boolean;
  isDisabled: boolean = true;

  remoteClipboard!: string | null;
  localClipboard: boolean = true;

  private permissionsStatus!: PermissionStatus;

  constructor(private messageService: MessageService,
              private vncService: VncService,
              private clipboard: Clipboard) {}

  ngOnInit() {
    this.vncService.isView$
      .pipe(untilDestroyed(this))
      .subscribe((isView: boolean) => {
        this.isView = isView;
        this.calcButtonStatus();
      });
    this.vncService.isConnected$
      .pipe(untilDestroyed(this))
      .subscribe((isConnected: boolean) => {
        this.isConnected = isConnected;
        this.calcButtonStatus();
      });
    this.vncService.remoteClipboard$
      .pipe(untilDestroyed(this))
      .subscribe((remoteClipboard: string | null) => this.remoteClipboard = remoteClipboard);
    this.getClipboardPermissions();
  }

  ngOnDestroy() {
    if (this.permissionsStatus) {
      this.permissionsStatus.removeEventListener('change', this.onClipboardPermission);
    }
  }

  onGetClipboard(): void {
    if (!this.remoteClipboard) {
      return;
    }
    this.clipboard.copy(vncBufferEncode(this.remoteClipboard));
    this.messageService.add(getToastMessage('clipboard_get'));
  }

  onSendClipboard(): void {
    if (!this.localClipboard) {
      return;
    }
    navigator.clipboard.readText()
      .then((clipboardText: string) => this.vncService.clipboardPaste(vncBufferDecode(clipboardText)))
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

  private calcButtonStatus(): void {
    this.isDisabled = !this.isConnected || this.isView;
  }
}
