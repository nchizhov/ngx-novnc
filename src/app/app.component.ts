import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';
// @ts-ignore
import RFB from "@novnc/novnc/core/rfb.js";
import {MessageService} from 'primeng/api';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

import {getToastMessage} from './toast-messages';
import {PasswordDialogComponent} from './dialogs/password-dialog/password-dialog.component';
import {IVncButton} from './interfaces/vnc-button.interface';
import {toggleButtons} from './toggle-buttons';
import {VncService} from './vnc.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    VncService,
    MessageService,
    DialogService
  ]
})
export class AppComponent implements OnDestroy {
  @ViewChild('vnc', {static: true}) vnc!: ElementRef;

  rfb: RFB;
  remoteClipboard: string | null = null;
  isConnecting: boolean = false;
  isConnected: boolean = false;
  isView: boolean = false;

  dialogRef!: DynamicDialogRef;

  private toggleButtons: {[s: string]: IVncButton} = toggleButtons;
  private vncListeners: {[s: string]: Function} = {
    'connect': this.onVNCConnect.bind(this),
    'securityfailure': this.onVNCSecurityFailure.bind(this),
    'clipboard': this.onGetVNCClipboard.bind(this)
  };

  constructor(private vncService: VncService,
              private dialogService: DialogService,
              private messageService: MessageService) {}

  onConnectDialog(): void {
    if (this.vncService.isRFB()) {
      return;
    }
    this.dialogRef = this.dialogService.open(PasswordDialogComponent, {
      header: 'Пароль подключения',
      width: '500px'
    });
    this.dialogRef.onClose
      .pipe(untilDestroyed(this))
      .subscribe((password: string | undefined) => {
        if (password) {
          this.vncService.start(this.vnc.nativeElement, '192.168.50.200', password);
        }
      });
  }

  private startClient(password: string): void {
    this.isConnecting = true;
    this.rfb = new RFB(this.vnc.nativeElement, this.createVNCUrl('192.168.50.200'), {
      credentials: {
        password: password
      }
    });
    this.rfb.background = '#2a323d';
    this.rfb.scaleViewport = true;
    this.addVNCListeners();
    this.rfb.addEventListener('disconnect', this.onVNCDisconnect.bind(this));
    this.rfb.focus();
  }

  ngOnDestroy() {
    this.vncService.stop();
    if (this.dialogRef) {
      this.dialogRef.destroy();
    }
  }

  private addVNCListeners(): void {
    if (this.rfb) {
      Object.entries(this.vncListeners).forEach(([event, action]) => this.rfb.addEventListener(event, action));
    }
  }

  private removeEventListeners(): void {
    if (this.rfb) {
      Object.entries(this.vncListeners).forEach(([event, action]) => this.rfb.removeEventListener(event, action));
    }
  }

  resetToggleButtons(): void {
    Object.keys(this.toggleButtons)
      .forEach((button: string) => this.toggleButtons[button].status = false);
  }

  private createVNCUrl(client: string): string {
    const protocol: string = (window.location.protocol === 'https:') ? 'wss' : 'ws';
    return `${protocol}://${window.location.hostname}/novnc/vnc/${client}`;
  }

  /*  Clipboard*/
  private onGetVNCClipboard(e: CustomEvent): void {
    this.remoteClipboard = e.detail.text;
  }

  private onVNCConnect(): void {
    if (!this.rfb) {
      return;
    }
    console.log('Connected');
    this.isView = false;
    this.isConnected = true;
    this.isConnecting = false;
  }

  onVNCSecurityFailure(e: CustomEvent): void {
    if (!this.rfb) {
      return;
    }
    let reason: string = 'security';
    let reasonDetails: string | null = null;
    if (e.detail.hasOwnProperty('reason')) {
      reason = 'security_reason';
      reasonDetails = e.detail.reason;
    }
    this.messageService.add(getToastMessage(reason, reasonDetails));
  }

  private onVNCDisconnect(e: CustomEvent): void {
    if (!this.rfb) {
      return;
    }
    if (!e.detail.clean) {
      if (this.isConnected) {
        this.messageService.add(getToastMessage('connection_lost'));
      }
    }
    console.log('Disconnected');
    this.removeEventListeners();
    this.resetToggleButtons();
    this.remoteClipboard = null;
    this.isView = false;
    this.isConnected = false;
    this.isConnecting = false;
    this.rfb.removeEventListener('disconnect', this.onVNCDisconnect);
    this.rfb = undefined;
  }
}
