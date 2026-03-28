{
  description = "Squirrel website";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {nixpkgs, ...}: let
    systems = ["x86_64-linux" "aarch64-linux" "aarch64-darwin"];
    forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f system);
  in {
    devShells = forAllSystems (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs
          pnpm
          pkgs.chromium
        ];

        shellHook = ''
          export CHROME_PATH=${pkgs.chromium}/bin/chromium
        '';
      };
    });

    packages = forAllSystems (system: let
      pkgs = import nixpkgs {inherit system;};
      lib = pkgs.lib;

      filteredSrc = lib.fileset.toSource {
        root = ./.;
        fileset = lib.fileset.unions [
          ./src
          ./static
          ./package.json
          ./pnpm-lock.yaml
          ./svelte.config.js
          ./vite.config.ts
          ./tsconfig.json
        ];
      };
    in {
      default = pkgs.stdenv.mkDerivation {
        pname = "squirrel-website";
        version = "1.0.0";
        src = filteredSrc;

        nativeBuildInputs = [
          pkgs.nodejs
          pkgs.pnpm
          pkgs.pnpmConfigHook
        ];

        buildInputs = [
          pkgs.chromium
        ];

        pnpmDeps = pkgs.fetchPnpmDeps {
          pname = "squirrel-website";
          version = "1.0.0";
          src = filteredSrc;
          fetcherVersion = 3;
          hash = "sha256-H3GG9x4PNWksK/EPimv4L2NvCmr58QvqXXL95XZWwPg=";
        };

        buildPhase = ''
          runHook preBuild
          export CI=true
          export CHROME_PATH=${pkgs.chromium}/bin/chromium
          pnpm build
          runHook postBuild
        '';

        installPhase = ''
          runHook preInstall
          mkdir -p "$out"
          cp -r build/* "$out"/
          runHook postInstall
        '';
      };
    });
  };
}
