#ifndef AppVersion
  #error "AppVersion must be provided from the root package.json"
#endif
#ifndef CoreSha256
  #error "CoreSha256 must be provided by the Windows package script"
#endif
#ifndef TargetArch
  #define TargetArch "x64"
#endif
#if TargetArch == "arm64"
  #define AllowedArch "arm64"
#else
  #define AllowedArch "x64os"
#endif

[Setup]
AppId={{73E7BE16-AD16-4C19-9818-815CE44B7F05}
AppName={cm:ProductName}
AppVersion={#AppVersion}
AppVerName={cm:ProductName} {#AppVersion}
AppPublisher=CsModular
DefaultDirName={code:GetDefaultPluginDir}
UsePreviousAppDir=yes
SetupMutex=PulvisInstallerOperation
UsePreviousLanguage=no
DisableProgramGroupPage=yes
DisableWelcomePage=no
UninstallDisplayName={cm:ProductName} {#AppVersion} - CsModular
UninstallDisplayIcon={app}\assets\pulvis-icon.png
PrivilegesRequired=lowest
ArchitecturesAllowed={#AllowedArch}
ArchitecturesInstallIn64BitMode={#AllowedArch}
OutputDir=.
OutputBaseFilename=Pulvis-{#AppVersion}-windows-{#TargetArch}
SetupIconFile=..\src-tauri\icons\icon.ico
WizardStyle=modern dynamic polar includetitlebar
WizardImageFile=wizard-image.png
WizardSmallImageFile=wizard-small.png
WizardImageFileDynamicDark=wizard-image.png
WizardSmallImageFileDynamicDark=wizard-small.png
ShowLanguageDialog=no
LanguageDetectionMethod=uilanguage
Compression=lzma2/ultra64
SolidCompression=yes
Uninstallable=yes
UninstallFilesDir={app}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "chinesesimp"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[CustomMessages]
english.ProductName=Pulvis
english.WelcomeTitle=Pulvis for CsModular
english.WelcomeText=Install Pulvis for CsModular. Pulvis Grain Freeze, Pulvis Grain Sample, and Pulvis Grain Osc keep the same controls and sound engine.%n%nPulvis 0.0.6 installs in the selected CsModular library folder.
english.SelectDirTitle=Choose the Pulvis library folder
english.SelectDirText=Pulvis 0.0.6 will be installed in the selected library folder.
english.WriteFailed=Could not update the selected library. Close CsModular and check the folder permissions and free disk space.
english.InvalidTarget=Select the CsModular libraries\pulvis folder. Its parent _index.json must contain a libraries list.
english.ReadyTitle=Ready to install Pulvis
english.FinishedTitle=Pulvis is ready
english.FinishedText=Pulvis 0.0.6 has been installed. Restart CsModular to load the modules.

chinesesimp.ProductName=微粒
chinesesimp.WelcomeTitle=为 CsModular 安装微粒
chinesesimp.WelcomeText=为 CsModular 安装微粒。微粒 · 颗粒冻结、微粒 · 颗粒采样和微粒 · 颗粒振荡器保留原有控制项与声音引擎。%n%n微粒 0.0.6 将安装到所选的 CsModular 库文件夹。
chinesesimp.SelectDirTitle=选择 Pulvis 库文件夹
chinesesimp.SelectDirText=微粒 0.0.6 将安装到所选的插件库文件夹。
chinesesimp.WriteFailed=无法更新所选模块库。请关闭 CsModular，检查目录写入权限和可用磁盘空间。
chinesesimp.InvalidTarget=请选择 CsModular 的 libraries\pulvis 文件夹；其上级 _index.json 必须包含 libraries 列表。
chinesesimp.ReadyTitle=准备安装微粒
chinesesimp.FinishedTitle=微粒已就绪
chinesesimp.FinishedText=微粒 0.0.6 已安装。请重新启动 CsModular 以加载模块。

russian.ProductName=Пульвис
russian.WelcomeTitle=Установка Пульвиса для CsModular
russian.WelcomeText=Установите Пульвис для CsModular. Модули «Пульвис · Гранулярная заморозка», «Пульвис · Гранулярный сэмпл» и «Пульвис · Гранулярный осциллятор» сохраняют прежние элементы управления и звуковой движок.%n%nПульвис 0.0.6 будет установлен в выбранную папку библиотеки CsModular.
russian.SelectDirTitle=Выберите папку библиотеки Pulvis
russian.SelectDirText=Пульвис 0.0.6 будет установлен в выбранную папку библиотеки.
russian.WriteFailed=Не удалось обновить выбранную библиотеку. Закройте CsModular и проверьте права на запись и свободное место.
russian.InvalidTarget=Выберите папку CsModular libraries\pulvis. В её родительском _index.json должен быть список libraries.
russian.ReadyTitle=Готово к установке Пульвиса
russian.FinishedTitle=Пульвис готов
russian.FinishedText=Пульвис 0.0.6 установлен. Перезапустите CsModular, чтобы загрузить модули.

[Messages]
english.WelcomeLabel1=Pulvis for CsModular
english.WelcomeLabel2=Install Pulvis for CsModular. Pulvis Grain Freeze, Pulvis Grain Sample, and Pulvis Grain Osc keep the same controls and sound engine.%n%nPulvis 0.0.6 installs in the selected CsModular library folder.
english.SelectDirLabel3=Choose the Pulvis library folder
english.SelectDirDesc=Pulvis 0.0.6 will be installed in the selected library folder.
english.ReadyLabel1=Ready to install Pulvis
english.FinishedHeadingLabel=Pulvis is ready
english.FinishedLabel=Pulvis 0.0.6 has been installed. Restart CsModular to load the modules.
chinesesimp.WelcomeLabel1=为 CsModular 安装微粒
chinesesimp.WelcomeLabel2=为 CsModular 安装微粒。微粒 · 颗粒冻结、微粒 · 颗粒采样和微粒 · 颗粒振荡器保留原有控制项与声音引擎。%n%n微粒 0.0.6 将安装到所选的 CsModular 库文件夹。
chinesesimp.SelectDirLabel3=选择 Pulvis 库文件夹
chinesesimp.SelectDirDesc=微粒 0.0.6 将安装到所选的插件库文件夹。
chinesesimp.ReadyLabel1=准备安装微粒
chinesesimp.FinishedHeadingLabel=微粒已就绪
chinesesimp.FinishedLabel=微粒 0.0.6 已安装。请重新启动 CsModular 以加载模块。
russian.WelcomeLabel1=Установка Пульвиса для CsModular
russian.WelcomeLabel2=Установите Пульвис для CsModular. Модули «Пульвис · Гранулярная заморозка», «Пульвис · Гранулярный сэмпл» и «Пульвис · Гранулярный осциллятор» сохраняют прежние элементы управления и звуковой движок.%n%nПульвис 0.0.6 будет установлен в выбранную папку библиотеки CsModular.
russian.SelectDirLabel3=Выберите папку библиотеки Pulvis
russian.SelectDirDesc=Пульвис 0.0.6 будет установлен в выбранную папку библиотеки.
russian.ReadyLabel1=Готово к установке Пульвиса
russian.FinishedHeadingLabel=Пульвис готов
russian.FinishedLabel=Пульвис 0.0.6 установлен. Перезапустите CsModular, чтобы загрузить модули.

[Files]
Source: "..\..\modules\GrainFreeze.js"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\modules\GrainFreeze.txt"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\modules\GrainSample.js"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\modules\GrainSample.txt"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\modules\GrainOsc.js"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\modules\GrainOsc.txt"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\_index.json"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\_meta.json"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\README.md"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\README.zh-CN.md"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\README.ru.md"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\LICENSE"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\assets\pulvis-icon.png"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\assets\pulvis-header-en.png"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\assets\pulvis-social-preview.png"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\assets\pulvis-header-zh-CN.png"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\assets\pulvis-header-ru.png"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\examples\pulvis-demo.json"; DestDir: "{tmp}"; Flags: dontcopy
Source: "..\..\csound\GrainCore.txt"; DestDir: "{tmp}"; Flags: dontcopy
Source: "registration.ps1"; DestDir: "{app}"; Flags: ignoreversion

[UninstallDelete]
Type: dirifempty; Name: "{app}\modules"
Type: dirifempty; Name: "{app}\assets"
Type: dirifempty; Name: "{app}\examples"
Type: files; Name: "{app}\_pulvis-library-registration-before-install"
Type: dirifempty; Name: "{app}"

[Code]
var
  PreviousLibraryRegistration: string;
  MigratedFolder: Boolean;
  Prepared: Boolean;
  DetectedLibrariesDirectory: string;
  DirectoryDetectionComplete: Boolean;
  DirectoryPageInitialized: Boolean;

function GetDriveTypeW(RootPathName: String): Cardinal;
external 'GetDriveTypeW@kernel32.dll stdcall';

procedure FindLibrariesSpan(Contents: string; var OpenPos, ClosePos: Integer);
var
  KeyPos, RelativePos: Integer;
begin
  OpenPos := 0;
  ClosePos := 0;
  KeyPos := Pos('"libraries"', Contents);
  if KeyPos = 0 then Exit;
  RelativePos := Pos('[', Copy(Contents, KeyPos, Length(Contents) - KeyPos + 1));
  if RelativePos = 0 then Exit;
  OpenPos := KeyPos + RelativePos - 1;
  RelativePos := Pos(']', Copy(Contents, OpenPos + 1, Length(Contents) - OpenPos));
  if RelativePos = 0 then
  begin
    OpenPos := 0;
    Exit;
  end;
  ClosePos := OpenPos + RelativePos;
end;

function IsSupportedLibrariesDirectory(LibrariesDir: string): Boolean;
var
  IndexPath: string;
  IndexContents: AnsiString;
  OpenPos, ClosePos: Integer;
begin
  Result := False;
  if not DirExists(LibrariesDir) then Exit;
  IndexPath := AddBackslash(LibrariesDir) + '_index.json';
  if not FileExists(IndexPath) then Exit;
  if not LoadStringFromFile(IndexPath, IndexContents) then Exit;
  FindLibrariesSpan(string(IndexContents), OpenPos, ClosePos);
  Result := (OpenPos > 0) and (ClosePos > OpenPos);
end;

function IsSupportedPluginTarget(TargetDir: string): Boolean;
begin
  Result := (CompareText(ExtractFileName(RemoveBackslashUnlessRoot(TargetDir)), 'pulvis') = 0) and
    IsSupportedLibrariesDirectory(ExtractFileDir(RemoveBackslashUnlessRoot(TargetDir)));
end;

function TryGetLibrariesAtHostRoot(HostRoot: string): string;
var
  Candidate: string;
begin
  Result := '';
  Candidate := AddBackslash(HostRoot) + 'public\libraries';
  if IsSupportedLibrariesDirectory(Candidate) then begin Result := Candidate; Exit; end;
  Candidate := AddBackslash(HostRoot) + 'dist\libraries';
  if IsSupportedLibrariesDirectory(Candidate) then begin Result := Candidate; Exit; end;
  Candidate := AddBackslash(HostRoot) + 'resources\libraries';
  if IsSupportedLibrariesDirectory(Candidate) then begin Result := Candidate; Exit; end;
  Candidate := AddBackslash(HostRoot) + 'Contents\Resources\libraries';
  if IsSupportedLibrariesDirectory(Candidate) then begin Result := Candidate; Exit; end;
  Candidate := AddBackslash(HostRoot) + 'libraries';
  if IsSupportedLibrariesDirectory(Candidate) then Result := Candidate;
end;

function TryFindLibrariesFromPath(Location: string): string;
var
  CurrentPath, ParentPath: string;
  Attempt: Integer;
begin
  Result := '';
  Location := Trim(Location);
  if Location = '' then Exit;
  if FileExists(Location) then Location := ExtractFileDir(Location);
  if IsSupportedPluginTarget(Location) then begin
    Result := ExtractFileDir(RemoveBackslashUnlessRoot(Location));
    Exit;
  end;
  if IsSupportedLibrariesDirectory(Location) then begin
    Result := Location;
    Exit;
  end;

  CurrentPath := RemoveBackslashUnlessRoot(Location);
  for Attempt := 0 to 10 do begin
    if DirExists(CurrentPath) then begin
      Result := TryGetLibrariesAtHostRoot(CurrentPath);
      if Result <> '' then Exit;
    end;
    ParentPath := ExtractFileDir(CurrentPath);
    if (ParentPath = '') or (CompareText(ParentPath, CurrentPath) = 0) then Break;
    CurrentPath := RemoveBackslashUnlessRoot(ParentPath);
  end;
end;

function IsHostRepositoryName(Name: string): Boolean;
begin
  Result := (CompareText(Name, 'CsModular') = 0) or
    (CompareText(Name, 'csmodular') = 0) or
    (CompareText(Name, 'csmodular-main') = 0);
end;

function IsWorkspaceDirectory(Name: string): Boolean;
begin
  Result := (CompareText(Name, 'paper') = 0) or
    (CompareText(Name, 'projects') = 0) or
    (CompareText(Name, 'source') = 0) or
    (CompareText(Name, 'repos') = 0) or
    (CompareText(Name, 'code') = 0) or
    (CompareText(Name, 'dev') = 0) or
    (CompareText(Name, 'workspace') = 0) or
    (CompareText(Name, 'workspaces') = 0);
end;

function TryFindNamedHostInParent(ParentDir: string): string;
begin
  Result := '';
  Result := TryGetLibrariesAtHostRoot(AddBackslash(ParentDir) + 'CsModular');
  if Result <> '' then Exit;
  Result := TryGetLibrariesAtHostRoot(AddBackslash(ParentDir) + 'csmodular');
  if Result <> '' then Exit;
  Result := TryGetLibrariesAtHostRoot(AddBackslash(ParentDir) + 'csmodular-main');
end;

function TryFindHostInWorkspace(WorkspaceDir: string): string;
var
  FindRec: TFindRec;
  ChildPath: string;
begin
  Result := '';
  if not DirExists(WorkspaceDir) then Exit;
  if FindFirst(AddBackslash(WorkspaceDir) + '*', FindRec) then begin
    try
      repeat
        if (FindRec.Name <> '.') and (FindRec.Name <> '..') then begin
          ChildPath := AddBackslash(WorkspaceDir) + FindRec.Name;
          if DirExists(ChildPath) and IsHostRepositoryName(FindRec.Name) then begin
            Result := TryGetLibrariesAtHostRoot(ChildPath);
            if Result <> '' then Break;
          end;
        end;
      until not FindNext(FindRec);
    finally
      FindClose(FindRec);
    end;
  end;
end;

function TryFindHostUnder(ParentDir: string; ScanWorkspaceFolders: Boolean): string;
var
  FindRec: TFindRec;
  ChildPath: string;
begin
  Result := '';
  if not DirExists(ParentDir) then Exit;
  Result := TryFindNamedHostInParent(ParentDir);
  if (Result <> '') or not ScanWorkspaceFolders then Exit;

  if FindFirst(AddBackslash(ParentDir) + '*', FindRec) then begin
    try
      repeat
        if (FindRec.Name <> '.') and (FindRec.Name <> '..') then begin
          ChildPath := AddBackslash(ParentDir) + FindRec.Name;
          if DirExists(ChildPath) and IsWorkspaceDirectory(FindRec.Name) then begin
            Result := TryFindHostInWorkspace(ChildPath);
            if Result <> '' then Break;
          end;
        end;
      until not FindNext(FindRec);
    finally
      FindClose(FindRec);
    end;
  end;
end;

function TryFindLibrariesInCommandLine(CommandLine: string): string;
var
  I, TokenStart: Integer;
  Token: string;
begin
  Result := '';
  I := 1;
  while I <= Length(CommandLine) do begin
    while (I <= Length(CommandLine)) and ((CommandLine[I] = ' ') or (CommandLine[I] = #9)) do
      I := I + 1;
    if I > Length(CommandLine) then Break;

    if CommandLine[I] = '"' then begin
      I := I + 1;
      TokenStart := I;
      while (I <= Length(CommandLine)) and (CommandLine[I] <> '"') do
        I := I + 1;
      Token := Copy(CommandLine, TokenStart, I - TokenStart);
      if I <= Length(CommandLine) then I := I + 1;
    end else begin
      TokenStart := I;
      while (I <= Length(CommandLine)) and (CommandLine[I] <> ' ') and (CommandLine[I] <> #9) do
        I := I + 1;
      Token := Copy(CommandLine, TokenStart, I - TokenStart);
    end;

    if (Pos(':\', Token) > 0) or (Copy(Token, 1, 2) = '\\') then begin
      Result := TryFindLibrariesFromPath(Token);
      if Result <> '' then Exit;
    end;
  end;
end;

function TryDetectRunningHost: string;
var
  Locator, WMIService, Processes, Process: Variant;
  ProcessCount, I: Integer;
  ExecutablePath, CommandLine, ProcessText: string;
begin
  Result := '';
  try
    Locator := CreateOleObject('WbemScripting.SWbemLocator');
    WMIService := Locator.ConnectServer('.', 'root\cimv2');
    Processes := WMIService.ExecQuery('SELECT ExecutablePath, CommandLine FROM Win32_Process');
    ProcessCount := Processes.Count;
    for I := 0 to ProcessCount - 1 do begin
      Process := Processes.ItemIndex(I);
      try ExecutablePath := Process.ExecutablePath; except ExecutablePath := ''; end;
      Result := TryFindLibrariesFromPath(ExecutablePath);
      if Result <> '' then Exit;

      try CommandLine := Process.CommandLine; except CommandLine := ''; end;
      ProcessText := LowerCase(ExecutablePath + ' ' + CommandLine);
      if (Pos('csmodular', ProcessText) > 0) or (Pos('vite', ProcessText) > 0) or
        (Pos('cargo run', ProcessText) > 0) then begin
        Result := TryFindLibrariesInCommandLine(CommandLine);
        if Result <> '' then Exit;
      end;
    end;
  except
    Result := '';
  end;
end;

function DetectDefaultLibrariesDirectory: string;
var
  Candidate, HomeDir, OneDriveDir, DriveRoot: string;
  DriveNumber: Integer;
begin
  Result := '';

  Candidate := GetEnv('CSMODULAR_HOST_ROOT');
  Result := TryFindLibrariesFromPath(Candidate);
  if Result <> '' then Exit;
  Candidate := GetEnv('CSMODULAR_ROOT');
  Result := TryFindLibrariesFromPath(Candidate);
  if Result <> '' then Exit;

  Result := TryDetectRunningHost;
  if Result <> '' then Exit;

  HomeDir := GetEnv('USERPROFILE');
  if HomeDir <> '' then begin
    Result := TryFindHostUnder(HomeDir, True);
    if Result <> '' then Exit;
    Result := TryFindHostUnder(AddBackslash(HomeDir) + 'source\repos', True);
    if Result <> '' then Exit;
    Result := TryFindHostUnder(AddBackslash(HomeDir) + 'Documents\GitHub', True);
    if Result <> '' then Exit;
    Result := TryFindHostUnder(AddBackslash(HomeDir) + 'Projects', True);
    if Result <> '' then Exit;
    Result := TryFindHostUnder(AddBackslash(HomeDir) + 'Code', True);
    if Result <> '' then Exit;
    Result := TryFindHostUnder(AddBackslash(HomeDir) + 'Documents\Projects', True);
    if Result <> '' then Exit;
    Result := TryFindHostUnder(AddBackslash(HomeDir) + 'OneDrive\Documents\GitHub', True);
    if Result <> '' then Exit;
  end;

  OneDriveDir := GetEnv('OneDrive');
  if OneDriveDir <> '' then begin
    Result := TryFindHostUnder(AddBackslash(OneDriveDir) + 'Documents\GitHub', True);
    if Result <> '' then Exit;
  end;

  for DriveNumber := Ord('C') to Ord('Z') do begin
    DriveRoot := Chr(DriveNumber) + ':\';
    if GetDriveTypeW(DriveRoot) = 3 then begin
      Result := TryFindHostUnder(DriveRoot, True);
      if Result <> '' then Exit;
    end;
  end;

  Candidate := GetEnv('ProgramFiles');
  Result := TryFindHostUnder(Candidate, True);
  if Result <> '' then Exit;
  Candidate := GetEnv('ProgramFiles(x86)');
  Result := TryFindHostUnder(Candidate, True);
  if Result <> '' then Exit;
  Candidate := GetEnv('LOCALAPPDATA');
  Result := TryFindHostUnder(Candidate, True);
  if Result <> '' then Exit;
  Candidate := AddBackslash(GetEnv('LOCALAPPDATA')) + 'Programs';
  Result := TryFindHostUnder(Candidate, True);

end;

function GetDefaultPluginDir(Param: string): string;
begin
  if not DirectoryDetectionComplete then begin
    DetectedLibrariesDirectory := DetectDefaultLibrariesDirectory;
    DirectoryDetectionComplete := True;
  end;
  if DetectedLibrariesDirectory <> '' then
    Result := AddBackslash(DetectedLibrariesDirectory) + 'pulvis'
  else
    Result := ExpandConstant('{localappdata}\CsModular\public\libraries\pulvis');
end;

function GetCoreDir(Param: string): string;
var
  LibrariesDir: string;
begin
  LibrariesDir := ExtractFileDir(ExpandConstant('{app}'));
  Result := AddBackslash(ExtractFileDir(LibrariesDir)) + 'csound\modules';
end;

procedure UpdateRegistration(Action, AppDir, Script, Index: string);
var
  Code: Integer;
  Args: string;
begin
  if CompareText(GetSHA256OfFile(Script), '{#GetSHA256OfFile(SourcePath + "registration.ps1")}') <> 0 then
    RaiseException('Pulvis registration helper checksum mismatch.');
  Args := '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + Script + '" -Action ' + Action +
    ' -PluginDir "' + AppDir + '"';
  if Index <> '' then Args := Args + ' -PayloadDir "' + Index + '"';
  if not Exec(ExpandConstant('{sys}\\WindowsPowerShell\\v1.0\\powershell.exe'), Args, '', SW_HIDE,
    ewWaitUntilTerminated, Code) or (Code <> 0) then RaiseException(CustomMessage('WriteFailed'));
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  if (CurPageID = wpSelectDir) and not IsSupportedPluginTarget(WizardForm.DirEdit.Text) then
  begin
    MsgBox(CustomMessage('InvalidTarget'), mbError, MB_OK);
    Result := False;
  end;
end;

procedure InitializeWizard;
begin
  if not DirectoryDetectionComplete then begin
    DetectedLibrariesDirectory := DetectDefaultLibrariesDirectory;
    DirectoryDetectionComplete := True;
  end;
  DirectoryPageInitialized := False;
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  if (CurPageID = wpSelectDir) and not DirectoryPageInitialized then begin
    DirectoryPageInitialized := True;
    if not IsSupportedPluginTarget(WizardForm.DirEdit.Text) then begin
      if DetectedLibrariesDirectory <> '' then
        WizardForm.DirEdit.Text := AddBackslash(DetectedLibrariesDirectory) + 'pulvis'
      else
        WizardForm.DirEdit.Text := '';
    end;
  end;
end;

function PrepareToInstall(var NeedsRestart: Boolean): string;
var
  AppDir, LegacyDir, Script: string;
begin
  Result := '';
  AppDir := ExpandConstant('{app}');
  LegacyDir := AddBackslash(ExtractFileDir(AppDir)) + 'granular';
  try
    if not IsSupportedPluginTarget(AppDir) then RaiseException(CustomMessage('InvalidTarget'));
    ExtractTemporaryFile('registration.ps1');
    Script := ExpandConstant('{tmp}\registration.ps1');
    ExtractTemporaryFile('GrainFreeze.js');
    ExtractTemporaryFile('GrainFreeze.txt');
    ExtractTemporaryFile('GrainSample.js');
    ExtractTemporaryFile('GrainSample.txt');
    ExtractTemporaryFile('GrainOsc.js');
    ExtractTemporaryFile('GrainOsc.txt');
    ExtractTemporaryFile('_index.json');
    ExtractTemporaryFile('_meta.json');
    ExtractTemporaryFile('README.md');
    ExtractTemporaryFile('README.zh-CN.md');
    ExtractTemporaryFile('README.ru.md');
    ExtractTemporaryFile('LICENSE');
    ExtractTemporaryFile('pulvis-icon.png');
    ExtractTemporaryFile('pulvis-header-en.png');
    ExtractTemporaryFile('pulvis-social-preview.png');
    ExtractTemporaryFile('pulvis-header-zh-CN.png');
    ExtractTemporaryFile('pulvis-header-ru.png');
    ExtractTemporaryFile('pulvis-demo.json');
    ExtractTemporaryFile('GrainCore.txt');
    if not DirExists(AppDir) and DirExists(LegacyDir) then begin
      UpdateRegistration('validate', LegacyDir, Script, '');
      if not RenameFile(LegacyDir, AppDir) then RaiseException(CustomMessage('InvalidTarget'));
      MigratedFolder := True;
    end else UpdateRegistration('validate', AppDir, Script, '');
    UpdateRegistration('install', AppDir, Script, ExpandConstant('{tmp}'));
    Prepared := True;
  except
    Result := GetExceptionMessage;
    if MigratedFolder then begin
      if RenameFile(AppDir, LegacyDir) then MigratedFolder := False;
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssDone then begin
    Prepared := False;
    MigratedFolder := False;
  end;
end;

procedure DeinitializeSetup;
var
  AppDir, LegacyDir: string;
begin
  if Prepared or MigratedFolder then begin
    AppDir := ExpandConstant('{app}');
    if Prepared then UpdateRegistration('rollback', AppDir, ExpandConstant('{tmp}\registration.ps1'), ExpandConstant('{tmp}'));
    LegacyDir := AddBackslash(ExtractFileDir(AppDir)) + 'granular';
    if MigratedFolder and DirExists(AppDir) and not DirExists(LegacyDir) then RenameFile(AppDir, LegacyDir);
  end;
end;

function InitializeUninstall: Boolean;
var
  AppDir: string;
begin
  Result := False;
  AppDir := ExpandConstant('{app}');
  try
    UpdateRegistration('validate', AppDir, AddBackslash(AppDir) + 'registration.ps1', '');
    Result := True;
  except
    if not UninstallSilent then MsgBox(GetExceptionMessage, mbError, MB_OK);
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  CorePath, CoreDirectory, PublicDirectory: string;
  AppDir, LibrariesDir, LegacyDir, IndexPath: string;
  RegistrationRecord: AnsiString;
begin
  AppDir := ExpandConstant('{app}');
  LibrariesDir := ExtractFileDir(RemoveBackslashUnlessRoot(AppDir));
  LegacyDir := AddBackslash(LibrariesDir) + 'granular';
  IndexPath := AddBackslash(LibrariesDir) + '_index.json';
  if CurUninstallStep = usUninstall then
  begin
    PreviousLibraryRegistration := 'pulvis';
    if LoadStringFromFile(AddBackslash(AppDir) + '_pulvis-library-registration-before-install', RegistrationRecord) then
      PreviousLibraryRegistration := Trim(string(RegistrationRecord));
    UpdateRegistration('uninstall', AppDir, AddBackslash(AppDir) + 'registration.ps1', '');
  end;
  if CurUninstallStep = usPostUninstall then
  begin
    if (PreviousLibraryRegistration = 'granular') and DirExists(AppDir) and not DirExists(LegacyDir) then
      RenameFile(AppDir, LegacyDir);
    CoreDirectory := GetCoreDir('');
    CorePath := AddBackslash(CoreDirectory) + 'GrainCore.txt';
    if FileExists(CorePath) and (CompareText(GetSHA256OfFile(CorePath), '{#CoreSha256}') = 0) then
    begin
      DeleteFile(CorePath);
      RemoveDir(CoreDirectory);
      PublicDirectory := ExtractFileDir(CoreDirectory);
      RemoveDir(PublicDirectory);
    end;
  end;
end;
