; QuickLauncher installer include (package.json build.nsis.include).
;
; Uninstall: moved desktop shortcuts go back before the app's files go
; (regions tech plan section 3, UX spec 5.5.6). The uninstaller runs
; "QuickLauncher.exe --ql-restore-all" and waits; the app moves every moved
; shortcut back to the folder it came from (else the desktop) and exits.
; If any shortcut is still in the store folder afterwards, a message box names
; the folder before the uninstall finishes.
;
; Why customRemoveFiles and not customUnInstall: electron-builder runs
; customUnInstall at the END of the uninstall section, after "RMDir /r $INSTDIR"
; has already removed QuickLauncher.exe; customUnInit runs before the Welcome
; page, where the user can still cancel. customRemoveFiles runs inside the
; section, after the stock "is QuickLauncher running?" check and before the
; files go. It replaces the stock removal block, which is copied below verbatim
; from app-builder-lib 25.1.8 (templates/nsis/uninstaller.nsh). Re-check that
; block whenever electron-builder is upgraded.
;
; An update runs the old uninstaller with --updated: nothing is restored then.

!macro customRemoveFiles
  ${ifNot} ${isUpdated}
    DetailPrint "Moving QuickLauncher shortcuts back to the desktop..."
    ClearErrors
    ExecWait '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" --ql-restore-all' $R8
    ${if} ${Errors}
      StrCpy $R8 "not run"
    ${endif}
    DetailPrint "Restore exit code: $R8"
    StrCpy $R7 "$PROFILE\QuickLauncher Shortcuts"
    StrCpy $R6 "0"
    ClearErrors
    FindFirst $R4 $R5 "$R7\*.lnk"
    ${ifNot} $R5 == ""
      StrCpy $R6 "1"
    ${endif}
    FindClose $R4
    ClearErrors
    FindFirst $R4 $R5 "$R7\*.url"
    ${ifNot} $R5 == ""
      StrCpy $R6 "1"
    ${endif}
    FindClose $R4
    ClearErrors
    ${if} $R6 == "1"
      MessageBox MB_OK|MB_ICONINFORMATION "Some shortcuts could not go back to the desktop.$\r$\nThey are in:$\r$\n$R7$\r$\n$\r$\nDrag them out when you want them back. Nothing was deleted." /SD IDOK
    ${elseif} $R8 == "0"
      ; Preserve any existing README or other user file. Only remove the
      ; folder if it is empty; RMDir without /r leaves nonempty folders.
      RMDir "$R7"
    ${endif}
  ${endif}

  ; ---- electron-builder 25.1.8 stock removal, verbatim ----
  ${if} ${isUpdated}
    CreateDirectory "$PLUGINSDIR\old-install"

    Push ""
    Call un.atomicRMDir
    Pop $R0

    ${if} $R0 != 0
      DetailPrint "File is busy, aborting: $R0"

      # Attempt to restore previous directory
      Push ""
      Call un.restoreFiles
      Pop $R0

      Abort `Can't rename "$INSTDIR" to "$PLUGINSDIR\old-install".`
    ${endif}

  ${endif}

  # Remove all files (or remaining shallow directories from the block above)
  RMDir /r $INSTDIR
!macroend
