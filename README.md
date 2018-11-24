# angelscripts-vps-mitosis

Angel scripts aiding in management of a VPS for cell(s) mitosis.

## usage

```
npm i angelscripts-vps-mitosis --save-dev
```

### angel vps :name setup

Setups vps by its name from `dna.vps.{name}` branch.
Uses `dna/vps/{name}/setup.sh` to provision the remote vps.

:warning: This also setups root cells on the target vps. 

The command can be re-run to take updates reflected.

### angel vps :name setup root cells

Useful to apply updates to remote root cells.

### angel vps :name -- :cmd

Executes a `cmd` to the remote vps via ssh.


## Testing

You're more than welcome to contribute tests for this repo.

## Contributing

We :hearts: contribution. Please follow these simple rules: 

- Keep the `README.md` up-to-date with changes
- Have fun :fire::rocket::shipit:
