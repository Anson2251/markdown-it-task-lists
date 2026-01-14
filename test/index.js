import fs from 'fs';
import md from 'markdown-it';
import { load as cheerioLoad } from 'cheerio';
import taskLists from '../src/index'

describe('markdown-it-task-lists', function() {
    var fixtures = {}, rendered = {}, $ = {}, parser;

    beforeAll(function() {
        var files = {
            bullet: 'bullet.md',
            ordered: 'ordered.md',
            mixedNested: 'mixed-nested.md',
            dirty: 'dirty.md'
        };

        parser = md().use(taskLists);

        for (var key in files) {
            fixtures[key] = fs.readFileSync(__dirname + '/fixtures/' + files[key]).toString();
            rendered[key] = parser.render(fixtures[key]);
            $[key] = cheerioLoad(rendered[key]);
        }
    });

    it('renders tab-indented code differently than default markdown-it', function() {
        var parserDefault = md();
        var parserWithPlugin = md().use(taskLists);
        expect(parserDefault.render(fixtures.bullet)).not.toBe(parserWithPlugin.render(fixtures.bullet));
    });

    it('adds input.task-list-item-checkbox in items', function () {
        expect($.bullet('input.task-list-item-checkbox').length).toBeGreaterThan(0);
    });

    it('renders items marked up as [ ] as unchecked', function () {
        var shouldBeUnchecked = (fixtures.ordered.match(/[\.\*\+-]\s+\[ \]/g) || []).length;
        expect(shouldBeUnchecked).toBe($.ordered('input[type=checkbox].task-list-item-checkbox:not(:checked)').length);
    });

    it('renders items marked up as [x] as checked', function () {
        var shouldBeChecked = (fixtures.ordered.match(/[\.\*\+-]\s+\[[Xx]\]/g) || []).length;
        expect(shouldBeChecked).toBe($.ordered('input[type=checkbox].task-list-item-checkbox:checked').length);
    });

    it('disables the rendered checkboxes', function () {
        expect($.bullet('input[type=checkbox].task-list-item-checkbox:not([disabled])').length).toBe(0);
    });

    it('enables the rendered checkboxes when options.enabled is truthy', function () {
        var enabledParser = md().use(taskLists, {enabled: true});
        var $$ = cheerioLoad(enabledParser.render(fixtures.ordered));
        expect($$('input[type=checkbox].task-list-item-checkbox:not([disabled])').length).toBeGreaterThan(0);
    });

    it('adds class `enabled` to <li> elements when options.enabled is truthy', function () {
        var enabledParser = md().use(taskLists, {enabled: true});
        var $$ = cheerioLoad(enabledParser.render(fixtures.ordered));
        expect($$('.task-list-item:not(.enabled)').length).toBe(0);
    });

    it('skips rendering wrapping <label> elements', function () {
        expect($.bullet('label').length).toBe(0);
        expect($.ordered('label').length).toBe(0);
        expect($.mixedNested('label').length).toBe(0);
        expect($.dirty('label').length).toBe(0);
    });

    it('does not render wrapping <label> elements when options.label is falsy', function () {
        var unlabeledParser = md().use(taskLists, {label: false});
        var $$ = cheerioLoad(unlabeledParser.render(fixtures.ordered));
        expect($$('label').length).toBe(0);
    });

    it("wraps the rendered list items' contents in a <label> element when options.label is truthy", function () {
        var labeledParser = md().use(taskLists, {label: true});
        var $$ = cheerioLoad(labeledParser.render(fixtures.ordered));
        expect($$('.task-list-item > label > input[type=checkbox].task-list-item-checkbox').length).toBeGreaterThan(0);
    });

    it('wraps and enables items when options.enabled and options.label are truthy', function () {
        var enabledLabeledParser = md().use(taskLists, {enabled: true, label: true});
        var $$ = cheerioLoad(enabledLabeledParser.render(fixtures.ordered));
        expect($$('.task-list-item > label > input[type=checkbox].task-list-item-checkbox:not([disabled])').length).toBeGreaterThan(0);
    });

    it('adds label after items when options.label and options.labelAfter are truthy', function() {
      var enabledLabeledParser = md().use(taskLists, {enabled: true, label: true, labelAfter: true});
      var $$ = cheerioLoad(enabledLabeledParser.render(fixtures.ordered));
      expect($$('.task-list-item > input[type=checkbox].task-list-item-checkbox:not([disabled])').next().is('label')).toBe(true);
    });

    it('does NOT render [  ], "[ ]" (no space after closing bracket), [ x], [x ], or [ x ] as checkboxes', function () {
        var html = $.dirty.html();
        expect(html).toContain('<li>[  ]');
        expect(html).toContain('<li>[ ]</li>');
        expect(html).toContain('<li>[x ]');
        expect(html).toContain('<li>[ x]');
        expect(html).toContain('<li>[ x ]');
    });

    it('adds class .task-list-item to parent <li>', function () {
        expect($.bullet('li.task-list-item').length).toBeGreaterThan(0);
    });

    it('adds class .contains-task-list to lists', function () {
        expect($.bullet('ol.contains-task-list, ul.contains-task-list').length).toBeGreaterThan(0);
    });

    it('only adds .contains-task-list to most immediate parent list', function () {
        expect($.mixedNested('ol:not(.contains-task-list) ul.contains-task-list').length).toBeGreaterThan(0);
    });
});
