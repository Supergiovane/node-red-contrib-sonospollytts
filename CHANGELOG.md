# Node-Red

[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.me/techtoday) 

<p>
<b>Version 1.0.20</b><br/>
- Fixed an issue, where if you changed the node-red httpAdminRoot, the node won't play anything. Thanks @JorinL.<br/>
</p>
<p>
<b>Version 1.0.19</b><br/>
- Added 9 Voices, thanks to user kitazaki.<br/>
</p>
<p>
<b>Version 1.0.18</b><br/>
- Removed some dependencies to speed up all the things.<br/>
</p>
<p>
<b>Version 1.0.16</b><br/>
- Changed a little behaviour related to the initial volume setting, when node-red starts or a flow is deployed.<br/>
- Applied lodash package security patch.<br/>
</p>
<p>
<b>Version 1.0.15</b><br/>
- Added the ability to select the temp folder, suitable for node-red installed behind hass.io or other similar apps, in case the sonos device can't reach node-red behind those apps. Check that the user can write to the filesystem<br/>
</p>
<p>
<b>Version 1.0.14</b><br/>
- Fixed a possible problem causing an exception in a very slow PC<br/>
- Added the output link and therefore changed the default node group from "output" to "advanced"<br/>
- The node send a msg.completed message during playback. true = ended playing, false = is playing<br/>
- Update sonos dependency to >=1.10.0
</p>
<p>
<b>Version 1.0.12</b><br/>
- You can now temporarely stop playing the Hailing sound via node message <code>msg.nohailing="true";</code> or <code>msg.nohailing="1";</code><br/>
</p>
<b>Version 1.0.8</b><br/>
- Updated sonos node dependency to 1.9.0<br/>
- Changed some icons in the config page<br/>
- Trimmed white spaces in the setting's textboxes to avoid issue when someone put a space in the textboxes. Thanks @1to4<br/>
- Fixed an issue, where if you have more nodes with different settings, e.g. different Sonos IP address or Polly Voice, all nodes take the settings of the last node added.<br/>
</p>
<p>
<b>Version 1.0.7</b><br/>
- Added voice Vicky (German). Thanks @PBue for the suggestion.<br/>
</p>
<p>
<b>Version 1.0.6</b><br/>
- Bugfix due to the httpRoot.<br/>
</p>
<p>
<b>Version 1.0.5</b><br/>
- respect Node-RED httpRoot setting (this is necessary e.g. in environments where Node-RED runs behind a reverse proxy on a non-root path). Thanks @hobbyquaker.<br/>
</p>
<p>
<b>Version 1.0.4</b><br/>
- Little minor update<br/>
</p>
<p>
<b>Version 1.0.3</b><br/>
- Bugfix (Fixed bug where sometime setting the hailing to none, causes a problem)<br/>
</p>
<p>
<b>Version 1.0.2</b><br/>
- Added capability to set volume by passing a message msg.volume to the node<br/>
</p>
<p>
<b>Version 1.0.1</b><br/>
- Fixed very stupid mistake<br/>
</p>
<p>
<b>Version 1.0.0</b><br/>
- First public stable release<br/>
- Behavior changed: when Sonos is powered off or unreachable, the TTS texts will, now, not be queued anymore, otherwise when Sonos is powered on again, it plays all TTS texts at once.
</p>
<p>
<b>Version 0.0.25</b><br/>
- Added more hailing sounds<br/>
- If cannot create the temp dir (maybe for ACL), revert to the node dir.<br/>
- Aesthetics adjustments<br/>
</p>
<p>
<b>Version 0.0.24</b><br/>
- Bugfix: after 24 hours, the sonos event listener won't fires any event more.<br/>
</p>
<p>
<b>Version 0.0.23</b><br/>
- Bugfix: if the Sonos device is restarted, the node won't play TTS<br/>
- Bugfix: if the Sonos device was on LineIn, TVIn or so, the node won't play TTS<br/>
- Updated sonos API April 2018<br/>
- First stable beta release
<br/>
</p>
<p>
<b>Version 0.0.22</b><br/>
- Speed improvement<br/>
- Bugfix: if you manually change the volume via sonos App, the Node won't revert to the setted volume
<br/>
</p>
<p>
<b>Version 0.0.21</b><br/>
- Fix for too short text
<br/>
</p>
<p>
<b>Version 0.0.20</b><br/>
- Fixed handling long queues being stopped intermittently
<br/>
</p>
<p>
<b>Version 0.0.19</b><br/>
- Added direct play of files from url (http)
<br/>
</p>
<p>
<b>Version 0.0.15</b><br/>
- Polly download timeout bug fixes
<br/>
</p>
<p>
<b>Version 0.0.14</b><br/>
- Hailing bug fixes
<br/>
</p>
<p>
<b>Version 0.0.13</b><br/>
- Minor bug fixes
<br/>
</p>
<p>
<b>Version 0.0.11</b><br/>
- Hailing sound added. Before the first TTS message of the message queue, plays a file .mp3 to recall attention
<br/>
</p>
<p>
<b>Version 0.0.8</b><br/>
- Minor fixes
<br/>
</p>
<p>
<b>Version 0.0.6</b><br/>
- Stops music if a payload is received
<br/>
- Setting volume possible in the node configuration window
<br/>
- Better handling of the queue by using new sonos node apis.
<br/>
</p>
    
