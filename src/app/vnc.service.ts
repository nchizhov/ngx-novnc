import {Injectable} from '@angular/core';
// @ts-ignore
import RFB from '@novnc/novnc/core/rfb';
import {BehaviorSubject, Observable} from 'rxjs';
import {MessageService} from 'primeng/api';

import {getToastMessage} from './toast-messages';
import {IVncButton} from './interfaces/vnc-button.interface';
import {toggleButtons} from './toggle-buttons';
import {IVncKey} from './interfaces/vnc-key.interface';
import {VNCKeys} from './vnc-keys';

@Injectable()
export class VncService {
  private wsVNCPath: string = '/';
  private rfbBackground!: string;
  private computerName: string | null = null;
  private rfb: RFB;

  private toggleButtons: {[s: string]: IVncButton} = toggleButtons;
  private vncListeners: {[s: string]: Function} = {
    'connect': this.onVNCConnect.bind(this),
    'desktopname': this.onVNCDesktopName.bind(this),
    'securityfailure': this.onVNCSecurityFailure.bind(this),
    'clipboard': this.onGetVNCClipboard.bind(this)
  };

  private isConnecting: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isConnecting$: Observable<boolean> = this.isConnecting.asObservable();
  private isConnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isConnected$: Observable<boolean> = this.isConnected.asObservable();
  private isView: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isView$: Observable<boolean> = this.isView.asObservable();
  private remoteClipboard: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  remoteClipboard$: Observable<string | null> = this.remoteClipboard.asObservable();

  constructor(private messageService: MessageService) {}

  setWsVNCPath(path: string): void {
    this.wsVNCPath = path;
  }

  setBackground(color: string): void {
    this.rfbBackground = color;
    if (this.rfb) {
      this.rfb.background = this.rfbBackground;
    }
  }

  isRFB(): boolean {
    return !!(this.rfb);
  }

  start(element: HTMLElement, address: string, password: string): void {
    this.isConnecting.next(true);
    this.rfb = new RFB(element, this.createVNCUrl(address), {
      credentials: {
        password: password
      }
    });
    if (this.rfbBackground) {
      this.rfb.background = this.rfbBackground;
    }
    this.rfb.scaleViewport = true;
    this.addVNCListeners();
    this.rfb.addEventListener('disconnect', this.onVNCDisconnect.bind(this));
    this.rfb.focus();
  }

  stop(): void {
    if (this.rfb) {
      this.rfb.disconnect();
    }
  }

  sendAltCtrlDel(): void {
    this.rfb.sendCtrlAltDel();
    this.rfb.focus();
  }

  pressToggleButton(name: string): void {
    const button: IVncButton = this.toggleButtons[name];
    button.status = !button.status;
    this.rfb.sendKey(button.key.vnc, button.key.name, button.status);
    this.rfb.focus();
  }

  getToggleButtonStatus(name: string): boolean {
    return this.toggleButtons[name].status;
  }

  pressKey(name: string): void {
    const key: IVncKey = VNCKeys[name];
    this.rfb.sendKey(key.vnc, key.name);
    this.rfb.focus();
  }

  clipboardPaste(text: string): void {
    this.rfb.clipboardPasteFrom(text);
    this.rfb.focus();
  }

  toggleView(): void {
    this.rfb.viewOnly = !this.rfb.viewOnly;
    this.isView.next(this.rfb.viewOnly);
    this.resetToggleButtons();
  }

  getImageData(): ImageData {
    return this.rfb.getImageData();
  }

  getComputerName(): string | null {
    return this.computerName;
  }

  private onVNCDisconnect(e: CustomEvent): void {
    if (!e.detail.clean) {
      if (this.isConnected) {
        this.messageService.add(getToastMessage('connection_lost'));
      }
    }
    this.removeEventListeners();
    this.resetToggleButtons();
    this.remoteClipboard.next(null);
    this.isView.next(false);
    this.isConnected.next(false);
    this.isConnecting.next(false);
    this.rfb.removeEventListener('disconnect', this.onVNCDisconnect);
    this.computerName = null;
    this.rfb = undefined;
  }

  private addVNCListeners(): void {
    Object.entries(this.vncListeners).forEach(([event, action]) => this.rfb.addEventListener(event, action));
  }

  private removeEventListeners(): void {
    Object.entries(this.vncListeners).forEach(([event, action]) => this.rfb.removeEventListener(event, action));
  }

  private createVNCUrl(client: string): string {
    const protocol: string = (window.location.protocol === 'https:') ? 'wss' : 'ws';
    return `${protocol}://${window.location.hostname}${this.wsVNCPath}${client}`;
  }

  /* VNC Listeners */
  private onVNCConnect(): void {
    this.isView.next(false);
    this.isConnected.next(true);
    this.isConnecting.next(false);
  }

  private onVNCDesktopName(e: CustomEvent): void {
    this.computerName = e.detail.name;
  }

  private onVNCSecurityFailure(e: CustomEvent): void {
    let reason: string = 'security';
    let reasonDetails: string | null = null;
    if (e.detail.hasOwnProperty('reason')) {
      reason = 'security_reason';
      reasonDetails = e.detail.reason;
    }
    this.messageService.add(getToastMessage(reason, reasonDetails));
  }

  private onGetVNCClipboard(e: CustomEvent): void {
    this.remoteClipboard.next(e.detail.text);
  }

  /* VNC Buttons */

  private resetToggleButtons(): void {
    Object.keys(this.toggleButtons)
      .forEach((button: string) => this.toggleButtons[button].status = false);
  }
}
