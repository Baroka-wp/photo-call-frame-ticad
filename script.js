/* TICAD Youth Drive 2026 — Photo Frame
 * Mobile-first canvas composer: photo window + name + country.
 */

(function () {
    'use strict';

    // Geometry measured on frame.png (1274 x 1068).
    var FRAME = {
        width: 1274,
        height: 1068,
        photo: { x: 166, y: 275, w: 420, h: 454, r: 24 },
        name: { x: 172, baseline: 783, size: 51, maxWidth: 440 },
        country: { x: 172, baseline: 868, size: 60, maxWidth: 440 },
        orange: '#ce843c'
    };

    // The asterisks are intentional: they render as bold on WhatsApp.
    var SHARE_TEXT = [
        '*At Mensvic Grand Hotel, Accra | Aug 13–14, 2026*',
        '',
        "I am attending! 300 African & Japanese youth turning 'Youth Agenda 2055' from vision to action.",
        'This is Bigger than a drive! it is a movement!',
        '#TICADYouthDrive2026 #AfricaJapanYouth'
    ].join('\n');

    function PhotoFrameApp() {
        this.canvas = document.getElementById('photoCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.frameImage = new Image();
        this.frameReady = false;
        this.userImage = null;

        // Photo transform, in photo-window units.
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.cacheElements();
        this.buildCountryList();
        this.bindEvents();
        this.loadFrame();
    }

    PhotoFrameApp.prototype.cacheElements = function () {
        this.container = document.getElementById('canvasContainer');
        this.dropHint = document.getElementById('dropHint');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.nameInput = document.getElementById('fullName');
        this.countrySelect = document.getElementById('country');
        this.zoomRow = document.getElementById('zoomRow');
        this.zoomInput = document.getElementById('zoom');
        this.resetBtn = document.getElementById('resetPhoto');
        this.dragTip = document.getElementById('dragTip');
        this.toast = document.getElementById('toast');
    };

    PhotoFrameApp.prototype.buildCountryList = function () {
        if (typeof COUNTRIES === 'undefined') return;
        var frag = document.createDocumentFragment();
        for (var i = 0; i < COUNTRIES.length; i++) {
            var opt = document.createElement('option');
            opt.value = COUNTRIES[i][0];
            opt.textContent = COUNTRIES[i][1];
            frag.appendChild(opt);
        }
        this.countrySelect.appendChild(frag);
    };

    PhotoFrameApp.prototype.loadFrame = function () {
        var self = this;

        this.frameImage.onload = function () {
            self.frameReady = true;
            self.canvas.width = self.frameImage.naturalWidth || FRAME.width;
            self.canvas.height = self.frameImage.naturalHeight || FRAME.height;
            self.draw();
        };

        this.frameImage.onerror = function () {
            self.frameReady = true;
            self.showToast('Frame image could not be loaded.');
            self.draw();
        };

        this.frameImage.crossOrigin = 'anonymous';
        this.frameImage.src = './frame.png';

        // Redraw once the webfont is ready so the canvas text matches the design.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { self.draw(); });
        }
    };

    /* ---------- events ---------- */

    PhotoFrameApp.prototype.bindEvents = function () {
        var self = this;

        this.uploadBtn.addEventListener('click', function () { self.fileInput.click(); });
        this.dropHint.addEventListener('click', function () { self.fileInput.click(); });
        this.fileInput.addEventListener('change', function (e) {
            if (e.target.files && e.target.files[0]) self.handleFile(e.target.files[0]);
            e.target.value = '';
        });

        this.nameInput.addEventListener('input', function () { self.draw(); });
        this.countrySelect.addEventListener('change', function () { self.draw(); });

        this.downloadBtn.addEventListener('click', function () { self.download(); });
        this.shareBtn.addEventListener('click', function () { self.share(); });

        this.zoomInput.addEventListener('input', function () {
            self.zoom = parseFloat(self.zoomInput.value);
            self.clampOffsets();
            self.draw();
        });

        this.resetBtn.addEventListener('click', function () {
            self.zoom = 1;
            self.offsetX = 0;
            self.offsetY = 0;
            self.zoomInput.value = '1';
            self.draw();
        });

        this.bindDragAndDrop();
        this.bindPhotoGestures();
    };

    PhotoFrameApp.prototype.bindDragAndDrop = function () {
        var self = this;
        var stop = function (e) { e.preventDefault(); e.stopPropagation(); };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (name) {
            self.container.addEventListener(name, stop, false);
        });
        ['dragenter', 'dragover'].forEach(function (name) {
            self.container.addEventListener(name, function () {
                self.container.classList.add('drag-over');
            }, false);
        });
        ['dragleave', 'drop'].forEach(function (name) {
            self.container.addEventListener(name, function () {
                self.container.classList.remove('drag-over');
            }, false);
        });

        this.container.addEventListener('drop', function (e) {
            var files = e.dataTransfer && e.dataTransfer.files;
            if (files && files.length) self.handleFile(files[0]);
        }, false);
    };

    // Drag to reposition (mouse + touch), pinch to zoom.
    PhotoFrameApp.prototype.bindPhotoGestures = function () {
        var self = this;
        var pointers = {};
        var last = null;
        var pinchStart = null;

        function scaleFactor() {
            var rect = self.canvas.getBoundingClientRect();
            return rect.width ? self.canvas.width / rect.width : 1;
        }

        function distance(pts) {
            var keys = Object.keys(pts);
            var a = pts[keys[0]], b = pts[keys[1]];
            return Math.hypot(a.x - b.x, a.y - b.y);
        }

        this.canvas.addEventListener('pointerdown', function (e) {
            if (!self.userImage) return;
            self.canvas.setPointerCapture(e.pointerId);
            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
            var count = Object.keys(pointers).length;
            if (count === 1) {
                last = { x: e.clientX, y: e.clientY };
            } else if (count === 2) {
                pinchStart = { dist: distance(pointers), zoom: self.zoom };
            }
        });

        this.canvas.addEventListener('pointermove', function (e) {
            if (!self.userImage || !pointers[e.pointerId]) return;
            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
            var count = Object.keys(pointers).length;

            if (count >= 2 && pinchStart) {
                var ratio = distance(pointers) / (pinchStart.dist || 1);
                self.zoom = Math.min(3, Math.max(1, pinchStart.zoom * ratio));
                self.zoomInput.value = String(self.zoom);
            } else if (count === 1 && last) {
                var k = scaleFactor();
                self.offsetX += (e.clientX - last.x) * k;
                self.offsetY += (e.clientY - last.y) * k;
                last = { x: e.clientX, y: e.clientY };
            }
            self.clampOffsets();
            self.draw();
        });

        function release(e) {
            delete pointers[e.pointerId];
            if (Object.keys(pointers).length < 2) pinchStart = null;
            if (Object.keys(pointers).length === 0) last = null;
        }
        this.canvas.addEventListener('pointerup', release);
        this.canvas.addEventListener('pointercancel', release);
    };

    /* ---------- file handling ---------- */

    PhotoFrameApp.prototype.handleFile = function (file) {
        var self = this;

        if (!file.type || file.type.indexOf('image/') !== 0) {
            this.showToast('Please choose an image file.');
            return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                if (!img.naturalWidth || !img.naturalHeight) {
                    self.showToast('That image could not be read. Try another one.');
                    return;
                }
                self.userImage = img;
                self.zoom = 1;
                self.offsetX = 0;
                self.offsetY = 0;
                self.zoomInput.value = '1';

                self.dropHint.classList.add('hidden');
                self.zoomRow.hidden = false;
                self.dragTip.hidden = false;
                self.downloadBtn.disabled = false;
                self.shareBtn.disabled = false;
                self.draw();
            };
            img.onerror = function () {
                self.showToast('That image could not be read. Try another one.');
            };
            img.src = e.target.result;
        };

        reader.onerror = function () { self.showToast('Could not read the file.'); };
        reader.readAsDataURL(file);
    };

    /* ---------- drawing ---------- */

    PhotoFrameApp.prototype.photoLayout = function () {
        var p = FRAME.photo;
        var img = this.userImage;
        var imgRatio = img.naturalWidth / img.naturalHeight;
        var areaRatio = p.w / p.h;
        var w, h;

        if (imgRatio > areaRatio) {
            h = p.h;
            w = h * imgRatio;
        } else {
            w = p.w;
            h = w / imgRatio;
        }
        w *= this.zoom;
        h *= this.zoom;

        return {
            w: w,
            h: h,
            x: p.x + (p.w - w) / 2 + this.offsetX,
            y: p.y + (p.h - h) / 2 + this.offsetY
        };
    };

    PhotoFrameApp.prototype.clampOffsets = function () {
        if (!this.userImage) return;
        var p = FRAME.photo;
        // photoLayout() sizes do not depend on the offsets, so this is safe.
        var box = this.photoLayout();
        var slackX = Math.max(0, (box.w - p.w) / 2);
        var slackY = Math.max(0, (box.h - p.h) / 2);
        this.offsetX = Math.min(slackX, Math.max(-slackX, this.offsetX));
        this.offsetY = Math.min(slackY, Math.max(-slackY, this.offsetY));
    };

    PhotoFrameApp.prototype.roundedRect = function (ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    PhotoFrameApp.prototype.draw = function () {
        if (!this.frameReady) return;

        var ctx = this.ctx;
        var p = FRAME.photo;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.frameImage.complete && this.frameImage.naturalWidth) {
            ctx.drawImage(this.frameImage, 0, 0);
        } else {
            ctx.fillStyle = '#4e6338';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(p.x, p.y, p.w, p.h);
        }

        if (this.userImage) {
            var box = this.photoLayout();
            ctx.save();
            this.roundedRect(ctx, p.x, p.y, p.w, p.h, p.r);
            ctx.clip();
            ctx.drawImage(this.userImage, box.x, box.y, box.w, box.h);
            ctx.restore();
        }

        this.drawText();
    };

    PhotoFrameApp.prototype.fitFont = function (text, spec, weight, style) {
        var ctx = this.ctx;
        var size = spec.size;
        var family = "'Montserrat', system-ui, Arial, sans-serif";
        while (size > 26) {
            ctx.font = style + ' ' + weight + ' ' + size + "px " + family;
            if (ctx.measureText(text).width <= spec.maxWidth) break;
            size -= 1;
        }
        return size;
    };

    PhotoFrameApp.prototype.drawText = function () {
        var ctx = this.ctx;
        var name = (this.nameInput.value || '').trim().toUpperCase();
        var country = this.countrySelect.value
            ? this.countrySelect.options[this.countrySelect.selectedIndex].textContent.toUpperCase()
            : '';

        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = FRAME.orange;

        if (name) {
            this.fitFont(name, FRAME.name, 800, 'normal');
            ctx.fillText(name, FRAME.name.x, FRAME.name.baseline);
        }

        if (country) {
            this.fitFont(country, FRAME.country, 300, 'italic');
            ctx.fillText(country, FRAME.country.x, FRAME.country.baseline);
        }
    };

    /* ---------- output ---------- */

    PhotoFrameApp.prototype.fileName = function () {
        var name = (this.nameInput.value || 'participant').trim().toLowerCase()
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'participant';
        return 'ticad-youth-drive-2026-' + name + '.png';
    };

    PhotoFrameApp.prototype.download = function () {
        try {
            var link = document.createElement('a');
            link.download = this.fileName();
            link.href = this.canvas.toDataURL('image/png', 1.0);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.showToast('Image downloaded.');
        } catch (err) {
            this.showToast('Download failed. Try again.');
        }
    };

    PhotoFrameApp.prototype.share = function () {
        var self = this;

        if (!this.canvas.toBlob) {
            this.download();
            return;
        }

        this.canvas.toBlob(function (blob) {
            if (!blob) { self.download(); return; }
            var file = new File([blob], self.fileName(), { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    title: 'TICAD Youth Drive 2026',
                    text: SHARE_TEXT,
                    files: [file]
                }).catch(function () { /* user cancelled */ });
                return;
            }

            if (navigator.clipboard && window.ClipboardItem) {
                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                    .then(function () { self.showToast('Image copied to clipboard.'); })
                    .catch(function () { self.download(); });
                return;
            }

            self.download();
        }, 'image/png', 1.0);
    };

    PhotoFrameApp.prototype.showToast = function (message) {
        var self = this;
        this.toast.textContent = message;
        this.toast.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(function () {
            self.toast.classList.remove('show');
        }, 2600);
    };

    document.addEventListener('DOMContentLoaded', function () {
        window.ticadApp = new PhotoFrameApp();
    });
})();
