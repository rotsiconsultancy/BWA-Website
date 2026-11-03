import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import indexnow as app


class IndexNowTests(unittest.TestCase):
    def test_sitemap_filters_noindex_shop_and_deduplicates(self):
        xml = f'''<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>{app.ORIGIN}/shop</loc></url>
        <url><loc>{app.ORIGIN}/bracelets</loc></url>
        <url><loc>{app.ORIGIN}/bracelets</loc></url></urlset>'''
        self.assertEqual(app.sitemap_urls(xml), {app.ORIGIN + "/bracelets"})

    def test_foreign_host_rejected(self):
        with self.assertRaises(ValueError):
            app.sitemap_urls('''<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url><loc>https://other.example/product</loc></url></urlset>''')

    def test_future_journal_and_docs_are_not_submitted(self):
        urls = {app.ORIGIN, app.ORIGIN + "/journal"}
        previous = {"urls": list(urls)}
        self.assertEqual(app.select_urls(urls, previous, [
            "content/journal/future-post.md", "AGENTS.md", ".github/workflows/indexnow.yml"
        ]), [])

    def test_changed_and_removed_articles(self):
        article = app.ORIGIN + "/journal/stone"
        removed = app.ORIGIN + "/journal/removed"
        urls = {app.ORIGIN, app.ORIGIN + "/journal", article}
        selected = app.select_urls(urls, {"urls": list(urls | {removed})},
                                   ["content/journal/stone.md"])
        self.assertEqual(set(selected), urls | {removed})

    def test_shared_changes_notify_whole_site(self):
        urls = {app.ORIGIN, app.ORIGIN + "/bracelets"}
        self.assertEqual(set(app.select_urls(urls, {"urls": list(urls)},
                                            ["components/Header.tsx"])), urls)

    def test_submission_failure_preserves_baseline(self):
        with tempfile.TemporaryDirectory() as temp:
            state = Path(temp) / "state.json"
            original = '{"sha":"old","urls":[]}'
            state.write_text(original)
            xml = f'''<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url><loc>{app.ORIGIN}</loc></url></urlset>'''.encode()
            with patch.object(app, "STATE", state), patch("sys.argv", ["indexnow.py"]), \
                 patch.object(app, "git", return_value=""), \
                 patch.object(app, "request", side_effect=[
                     (200, app.KEY.encode()), (200, xml), RuntimeError("submission failed")
                 ]):
                with self.assertRaises(RuntimeError):
                    app.main()
            self.assertEqual(state.read_text(), original)


if __name__ == "__main__":
    unittest.main()
