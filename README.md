# dynamark
Render dynamic markdown files using [Handlebars](https://handlebarsjs.com/) templates.

## Installation
To install the package globally, you can run 

```bash
npm i -g dynamark
```

## Usage

```text
Usage: dynamark [options]

CLI to render markdown templates with data content

Options:
  -V, --version                  output the version number
  -t, --template <templatePath>  markdown template file path
  -d, --data <dataPath>          data file path (JSON or YAML)
  -o, --output <outputPath>      output file path (resulting markdown file)
  -l, --lint                     run markdownlint on the result
  -h, --help                     display help for command
```

### Example
If you want to render the [example template](examples/table.template.md) and [data file](examples/table.data.yaml), you can run the following:

```bash
dynamark -t examples/table.template.md -d examples/table.data.yaml --lint
```

This will produce the following output on `stdout`:

```markdown
# test

| Column1     | Column2     |
|-------------|-------------|
| test1 | test1 |
| test2 | test2 |
| test3 | test3 |
```


