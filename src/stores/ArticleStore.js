import SimpleStore from './SimpleStore'
import { DELETE_ARTICLE, ADD_COMMENT, LOAD_ALL_ARICLES, LOAD_ARTICLE_BY_ID, LOAD_COMMENTS_BY_ARTICLE_ID, _START, _FAIL, _SUCCESS } from '../actions/constants'
import AppDispatcher from '../dispatcher'
import { loadAllArticles } from '../actions/articles'

class ArticleStore extends SimpleStore {
    constructor(...args) {
        super(...args)
        this.dispatchToken = AppDispatcher.register((action) => {
            const { type, data, response, error } = action

            switch (type) {
                case DELETE_ARTICLE:
                    this.delete(data.id)
                    break;

                case ADD_COMMENT:
                    AppDispatcher.waitFor([this.__stores.comments.dispatchToken])
                    const article = this.getById(data.articleId)
                    article.comments = (article.comments || []).concat(data.id)
                    break

                case LOAD_ALL_ARICLES + _START:
                    this.loading = true
                    this.loaded = false
                    break;

                case LOAD_ALL_ARICLES + _FAIL:
                    this.loaded = false
                    this.loading = false
                    this.error = error
                    break

                case LOAD_ALL_ARICLES + _SUCCESS:
                    this.loaded = true
                    this.loading = false
                    response.forEach(this.add)
                    break;

                case LOAD_ARTICLE_BY_ID + _START:
                    this.getById(data.id).loading = true
                    break;

                case LOAD_ARTICLE_BY_ID + _SUCCESS:
                    this.add(response)
                    break;

                case LOAD_COMMENTS_BY_ARTICLE_ID + _START:
                    this.getById(data.id).loadingComments = true
                    this.getById(data.id).commentsLoaded = false
                    break;

                case LOAD_COMMENTS_BY_ARTICLE_ID + _SUCCESS:
                    AppDispatcher.waitFor([this.__stores.comments.dispatchToken])
                    this.getById(data.id).loadingComments = false
                    this.getById(data.id).commentsLoaded = true
                    break;

                default: return
            }

            this.emitChange()
        })
    }

    getOrLoadAll() {
        if (!this.loading && !this.loaded) loadAllArticles()
        return this.getAll()
    }
}

export default ArticleStore