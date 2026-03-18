{
  description = "Website development flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    systems = ["x86_64-linux" "aarch64-linux" "aarch64-darwin"];
    forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f system);

    mkPkgs = system: import nixpkgs {inherit system;};
  in {
    devShells = forAllSystems (
      system: let
        pkgs = mkPkgs system;
      in {
        default = pkgs.mkShell {
          packages = with pkgs; [
            pnpm
            nodejs
          ];
        };
      }
    );
  };
}
