# Mobile QR saving

The previous save control was a `download` anchor to a PNG data URL. That did not provide an alternative when mobile browsers or embedded webviews ignored downloading it.

The control now creates a real PNG `File` from the exact server-returned image bytes. On supported devices it checks `navigator.canShare({files})` and invokes native file sharing synchronously from the user's click, before any asynchronous preparation. It does not regenerate the QR or alter its token. If file sharing is absent, it requests a Blob URL download. After attempting either route it also offers direct PNG download and opening the image for long-press saving.

Cancelling a share does not secretly start another download. Unsupported/blocked share sheets show the explicit alternatives. Status text does not claim that the OS saved the file to Photos; the browser cannot verify that. Users can find downloaded PNGs in Files/Downloads, or open the image and use their browser's save-image action. Native share destinations vary by device.

Blob URLs stay valid until this ticket control unmounts. Repeated clicks share the same image URL; the URL is revoked on cleanup. Only confirmed bookings with a server-returned QR expose this control. No booking, email notification or database behavior changes.

Validation: five QR export tests verify exact PNG bytes, safe filenames, format rejection, synchronous native-share invocation, unsupported-share download and cancellation/permission failure. Existing form/ticket/schedule tests, ESLint, TypeScript and production build pass. A real iPhone/Android download or gallery-save action was not verified on physical hardware; desktop/browser code tests do not substitute for OS confirmation.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
