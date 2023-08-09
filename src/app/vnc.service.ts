import {Injectable} from '@angular/core';
// @ts-ignore
import RFB from '@novnc/novnc/core/rfb';
import {BehaviorSubject, Observable} from 'rxjs';
import {MessageService} from 'primeng/api';

import {getToastMessage} from './toast-messages';
import {IVncButton} from './interfaces/vnc-button.interface';
import {toggleButtons} from './toggle-buttons';

@Injectable()
export class VncService {
  private rfb: RFB;

  private toggleButtons: {[s: string]: IVncButton} = toggleButtons;
  private vncListeners: {[s: string]: Function} = {
    'connect': this.onVNCConnect.bind(this),
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

  isRFB(): boolean {
    return !!(this.rfb);
  }

  resetToggleButtons(): void {
    Object.keys(this.toggleButtons)
      .forEach((button: string) => this.toggleButtons[button].status = false);
  }

  start(element: HTMLElement, address: string, password: string): void {
    this.isConnecting.next(true);
    this.rfb = new RFB(element, this.createVNCUrl(address), {
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

  stop(): void {
    if (this.rfb) {
      this.rfb.disconnect();
    }
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
    this.remoteClipboard.next(null);
    this.isView.next(false);
    this.isConnected.next(false);
    this.isConnecting.next(false);
    this.rfb.removeEventListener('disconnect', this.onVNCDisconnect);
    this.rfb = undefined;
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

  private createVNCUrl(client: string): string {
    const protocol: string = (window.location.protocol === 'https:') ? 'wss' : 'ws';
    return `${protocol}://${window.location.hostname}/novnc/vnc/${client}`;
  }

  /* VNC Listeners */
  private onVNCConnect(): void {
    if (!this.rfb) {
      return;
    }
    console.log('Connected');
    this.isView.next(false);
    this.isConnected.next(true);
    this.isConnecting.next(false);
  }

  private onVNCSecurityFailure(e: CustomEvent): void {
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

  private onGetVNCClipboard(e: CustomEvent): void {
    this.remoteClipboard.next(e.detail.text);
  }
}