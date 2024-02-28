class DeviceService {
  constructor() {
    this.mapKeys = new Map([
      [0, 'mdi-alert-circle'],
      [1, 'mdi-alert-circle'],
      [2, 'mdi-certificate'],
      [3, 'mdi-book-cog'],
      [4, 'mdi-key-variant'],
      [6, 'mdi-security'],
      [7, 'mdi-shield-virus'],
      [9, 'mdi-domain'],
      [10, 'mdi-link-variant-off'],
      [11, 'mdi-wifi-strength-off'],
      [12, 'mdi-lock-alert'],
      [13, 'mdi-cellphone-off'],
      [14, 'mdi-debug-step-over'],
      [16, 'mdi-cloud-upload'],
      [17, 'mdi-download-multiple'],
      [18, 'mdi-alert-outline'],
      [19, 'mdi-alert-outline'],
      [20, 'mdi-alert-outline'],
      [21, 'mdi-lock-outline'],
      [22, 'mdi-desktop-classic'],
      [23, 'mdi-server-network-off'],
      [24, 'mdi-block-helper'],
      [25, 'mdi-ip-network-outline'],
      [26, 'mdi-power-plug-off'],
      [27, 'mdi-google'],
      [28, 'mdi-database-refresh'],
      [29, 'mdi-scanner'],
      [30, 'mdi-security-network'],
      [31, 'mdi-clock-alert'],
      [32, 'mdi-file-tree'],
      [33, 'mdi-web'],
    ])
  }

  /**
   *
   * @param eventType Number
   */
  getIconByEventType(eventType = 0) {
    let icon = this.mapKeys.get(eventType);
    return icon ?? 'mdi-alert';
  }
  getNameIconOsType(osName) {
    if (osName === 'ios')
      return 'mdi-apple';
    else if (osName === 'android')
      return 'mdi-android';
    else if (osName === 'windows')
      return 'mdi-microsoft-windows';
    else if (osName === 'osx')
      return 'mdi-apple-finder';
    else if (osName === 'linux')
      return 'mdi-linux';
    else
      return '';
  }
  getColorIconOsType(osName) {
    if (osName === 'ios')
      return '#FFFFFF';
    else if (osName === 'android')
      return '#34ab3e';
    else if (osName === 'windows')
      return '#41a1c3';
    else if (osName === 'osx')
      return '#0070C9';
    else
      return '';
  }
} export default new DeviceService()
