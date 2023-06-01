#!/usr/bin/env node
import { Command } from 'commander';
import Handlebars from 'handlebars';
import { parse } from 'yaml';
import markdownlint from 'markdownlint';
import packageData from '../package.json';
import { readFileSync, writeFileSync } from 'fs';
import { checkFileOrPath, toAbsolutePath } from './utils/helpers';

const program = new Command();

async function run() {
  program
    .name('dynamark')
    .description('CLI to render markdown templates with data content')
    .version(packageData.version);

  program
    .requiredOption('-t, --template <templatePath>', 'markdown template file path')
    .requiredOption('-d, --data <dataPath>', 'data file path (JSON or YAML)')
    .option('-o, --output <outputPath>', 'output file path (resulting markdown file)')
    .option('-l, --lint', 'run markdownlint on the result');

  // Parse
  program.parse(process.argv);

  // Get options
  const { template, data, output, lint } = program.opts();

  // Check file paths
  const templateResult = await checkFileOrPath(template);
  const dataResult = await checkFileOrPath(data);

  // Check results
  if (!templateResult.ok) {
    console.log(`Option 'template': ${templateResult.errorMessage}`);
    process.exit(-1);
  } else if (!dataResult.ok) {
    console.log(`Option 'data': ${dataResult.errorMessage}`);
    process.exit(-2);
  }

  // Get data file extension
  const dataPathParts = (dataResult.absolutePath as string).split('.');
  const extension = dataPathParts[dataPathParts.length - 1];

  if (templateResult.ok && dataResult.ok) {
    // Load markdown template
    const templateContents = readFileSync(templateResult.absolutePath as string, 'utf-8');

    // Read data
    const rawData = readFileSync(dataResult.absolutePath as string, 'utf-8');
    let data;

    // Check file extension
    if (['yaml', 'yml'].includes(extension)) {
      data = parse(rawData);
    } else if (extension === 'json') {
      data = JSON.parse(rawData);
    }

    // Compile template
    const template = Handlebars.compile(templateContents);

    // Render result
    const renderResult = template(data);

    // Check if render result shall be linted
    if (lint) {
      // Run markdown linting
      const lintResult = markdownlint.sync({
        "strings": {
          "renderedTemplate": renderResult, 
        }
      });

      // Show error messages if any are found
      if (lintResult.renderedTemplate && lintResult.renderedTemplate.length > 0) {
        const errorMessage = ['The following linting errors have been found:'];
        console.log(errorMessage.concat(lintResult.renderedTemplate.map(lintError => ` * ${lintError.ruleDescription}`)).join('\n'));
        process.exit(-4);
      }
    }

    // Check if render result should be writte to a file
    if (output) {
      // Check output path
      const outputAbsolutePath = await toAbsolutePath(output);
      const outputPathParts = outputAbsolutePath.split('/');

      // Remove file part
      outputPathParts.pop();

      // Get path to file
      const outputPath = outputPathParts.join('/')
      
      // Check if output path exists
      const outputResult = await checkFileOrPath(outputPath);

      if (outputResult.ok) {
        // Write file
        writeFileSync(output, renderResult, { encoding: 'utf-8' });
      } else {
        console.log(`Option 'output': ${outputResult.errorMessage}`);
        process.exit(-3);
      }
      
    } else {
      // Just write render result to stdout
      console.log(renderResult);
    }
  }
}

run();
